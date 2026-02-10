import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.1";
import {
  buildRemySurfacePayload,
  emptySurfacePayload,
} from "./remyPayloadBuilder.ts";
import type {
  AnswerRow,
  AssessmentRow,
  RemySurface,
  Schema,
} from "./remyPayloadBuilder.ts";

type RemyEventType = "remy_impression" | "remy_dismiss_nudge" | "remy_ack_action";

type RemyRequest = {
  action?: "get_surface_payload" | "dismiss_nudge" | "ack_action";
  assessment_id?: string;
  surface?: RemySurface;
  section_id?: string;
  nudge_id?: string;
  ttl_hours?: number;
  action_id?: string;
  target_href?: string;
  metadata?: Record<string, unknown>;
};

type ReadinessClient = ReturnType<ReturnType<typeof createClient>["schema"]>;

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function sanitizeText(value: string | undefined, maxLen = 200): string | null {
  if (!value) return null;
  const normalized = value.trim();
  if (!normalized) return null;
  return normalized.slice(0, maxLen);
}

function sanitizeInternalPath(path: string | undefined): string | null {
  if (!path) return null;
  if (!path.startsWith("/")) return null;
  if (path.startsWith("//")) return null;
  if (path.includes("://")) return null;
  if (/[\r\n]/.test(path)) return null;
  return path.slice(0, 512);
}

function sanitizeMetadata(
  metadata: Record<string, unknown> | undefined,
): Record<string, string | number | boolean | null> {
  if (!metadata || typeof metadata !== "object") return {};

  const result: Record<string, string | number | boolean | null> = {};
  for (const [rawKey, value] of Object.entries(metadata).slice(0, 12)) {
    const key = rawKey.trim().slice(0, 64);
    if (!key) continue;
    if (!/^[a-zA-Z0-9_.:-]+$/.test(key)) continue;

    if (typeof value === "string") {
      result[key] = value.trim().slice(0, 160);
      continue;
    }
    if (typeof value === "number" && Number.isFinite(value)) {
      result[key] = value;
      continue;
    }
    if (typeof value === "boolean") {
      result[key] = value;
      continue;
    }
    if (value === null) {
      result[key] = null;
    }
  }

  return result;
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function insertRemyEvent(
  readiness: ReadinessClient,
  params: {
    subjectId: string;
    assessmentDbId?: string | null;
    eventType: RemyEventType;
    payload: Record<string, unknown>;
  },
) {
  const { error } = await readiness.from("events").insert({
    subject_id: params.subjectId,
    assessment_id: params.assessmentDbId || null,
    event_type: params.eventType,
    payload: params.payload,
  });

  return error;
}

async function findActiveAssessment(
  readiness: ReadinessClient,
  subjectId: string,
  assessmentKey: string,
): Promise<AssessmentRow | null> {
  const { data, error } = await readiness
    .from("assessments")
    .select("id, status, report_status, report_stale, report_data, last_answer_at")
    .eq("subject_id", subjectId)
    .eq("assessment_id", assessmentKey)
    .neq("status", "archived")
    .maybeSingle();

  if (error) {
    console.error("[remy] findActiveAssessment error:", error);
    return null;
  }
  return data as AssessmentRow | null;
}

async function loadSchema(readiness: ReadinessClient, assessmentKey: string): Promise<Schema | null> {
  const { data, error } = await readiness
    .from("assessment_schemas")
    .select("schema_json")
    .eq("assessment_id", assessmentKey)
    .eq("version", "v1")
    .maybeSingle();

  if (error) {
    console.error("[remy] loadSchema error:", error);
    return null;
  }
  return (data?.schema_json as Schema) || null;
}

async function loadProfile(readiness: ReadinessClient, subjectId: string): Promise<Record<string, unknown>> {
  const { data } = await readiness
    .from("profile_intake")
    .select("profile_json")
    .eq("subject_id", subjectId)
    .maybeSingle();
  return (data?.profile_json as Record<string, unknown>) || {};
}

async function loadAnswers(readiness: ReadinessClient, assessmentId: string): Promise<AnswerRow[]> {
  const { data, error } = await readiness
    .from("assessment_answers")
    .select("question_id, section_id, answer_value, answer_label, score_fraction, question_text")
    .eq("assessment_id", assessmentId);
  if (error) {
    console.error("[remy] loadAnswers error:", error);
    return [];
  }
  return (data || []) as AnswerRow[];
}

async function loadDismissedMap(readiness: ReadinessClient, subjectId: string): Promise<Record<string, string>> {
  const { data, error } = await readiness
    .from("remy_preferences")
    .select("dismissed_nudges")
    .eq("subject_id", subjectId)
    .maybeSingle();
  if (error) {
    console.error("[remy] loadDismissedMap error:", error);
    return {};
  }
  return (data?.dismissed_nudges as Record<string, string>) || {};
}

async function buildSurfacePayload(
  readiness: ReadinessClient,
  subjectId: string,
  assessmentKey: string,
  surface: RemySurface,
  sectionId?: string,
) {
  const assessment = await findActiveAssessment(readiness, subjectId, assessmentKey);
  if (!assessment) {
    return {
      payload: emptySurfacePayload(surface),
      assessmentDbId: null,
    };
  }

  const [schema, profile, answers, dismissed] = await Promise.all([
    loadSchema(readiness, assessmentKey),
    loadProfile(readiness, subjectId),
    loadAnswers(readiness, assessment.id),
    loadDismissedMap(readiness, subjectId),
  ]);

  return {
    payload: buildRemySurfacePayload({
      assessment,
      schema,
      profile,
      answers,
      dismissed,
      surface,
      sectionId,
    }),
    assessmentDbId: assessment.id,
  };
}

async function ensureUserSubject(
  readiness: ReadinessClient,
  userId: string,
): Promise<{ id?: string; error?: string }> {
  const { data: existing, error: fetchError } = await readiness
    .from("subjects")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (fetchError) {
    return { error: fetchError.message };
  }

  if (existing?.id) {
    return { id: existing.id as string };
  }

  const { data: created, error: insertError } = await readiness
    .from("subjects")
    .insert({ kind: "user", user_id: userId })
    .select("id")
    .single();

  if (insertError) {
    return { error: insertError.message };
  }

  return { id: created.id as string };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");

  if (!supabaseUrl || !serviceRoleKey || !anonKey) {
    return jsonResponse({ error: "Missing Supabase environment configuration" }, 500);
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return jsonResponse({ error: "Missing authorization header" }, 401);
  }

  const authClient = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false },
    global: { headers: { Authorization: authHeader } },
  });
  const { data: authData, error: authError } = await authClient.auth.getUser();
  if (authError || !authData.user) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
  const readiness = supabase.schema("readiness_v1");

  const subjectResult = await ensureUserSubject(readiness, authData.user.id);
  if (!subjectResult.id) {
    return jsonResponse(
      { error: "Unable to resolve subject", detail: subjectResult.error ?? "unknown" },
      500,
    );
  }
  const subjectId = subjectResult.id;

  let payload: RemyRequest;
  try {
    payload = await req.json();
  } catch (_err) {
    return jsonResponse({ error: "Invalid JSON payload" }, 400);
  }

  const action = payload.action || "get_surface_payload";
  const assessmentKey = payload.assessment_id || "readiness_v1";

  if (action === "dismiss_nudge") {
    if (!payload.nudge_id) {
      return jsonResponse({ error: "nudge_id is required" }, 400);
    }
    const nudgeId = sanitizeText(payload.nudge_id, 160);
    if (!nudgeId) {
      return jsonResponse({ error: "nudge_id is invalid" }, 400);
    }

    const ttlHours = Math.max(1, Math.min(Number(payload.ttl_hours || 24), 24 * 30));
    const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000).toISOString();
    const currentMap = await loadDismissedMap(readiness, subjectId);
    const nextMap = { ...currentMap, [nudgeId]: expiresAt };

    const { error } = await readiness
      .from("remy_preferences")
      .upsert(
        {
          subject_id: subjectId,
          dismissed_nudges: nextMap,
        },
        { onConflict: "subject_id" },
      );

    if (error) {
      console.error("[remy] dismiss_nudge upsert error:", error);
      return jsonResponse({ error: "Failed to dismiss nudge" }, 500);
    }

    const assessment = await findActiveAssessment(readiness, subjectId, assessmentKey);
    const dismissEventError = await insertRemyEvent(readiness, {
      subjectId,
      assessmentDbId: assessment?.id || null,
      eventType: "remy_dismiss_nudge",
      payload: {
        nudge_id: nudgeId,
        ttl_hours: ttlHours,
        dismissed_until: expiresAt,
      },
    });

    if (dismissEventError) {
      console.error("[remy] dismiss_nudge event insert error:", dismissEventError);
    }

    return jsonResponse({ success: true, nudge_id: nudgeId, dismissed_until: expiresAt });
  }

  if (action === "ack_action") {
    const assessment = await findActiveAssessment(readiness, subjectId, assessmentKey);
    const actionId = sanitizeText(payload.action_id, 160);
    const targetHref = sanitizeInternalPath(payload.target_href);
    const eventPayload = {
      action_id: actionId,
      target_href: targetHref,
      surface: payload.surface || "dashboard",
      metadata: sanitizeMetadata(payload.metadata),
      acknowledged_at: new Date().toISOString(),
    };

    const error = await insertRemyEvent(readiness, {
      subjectId,
      assessmentDbId: assessment?.id || null,
      eventType: "remy_ack_action",
      payload: eventPayload,
    });

    if (error) {
      console.error("[remy] ack_action insert error:", error);
      return jsonResponse({ error: "Failed to record action acknowledgement" }, 500);
    }

    return jsonResponse({ success: true });
  }

  const surface = payload.surface || "dashboard";
  const { payload: response, assessmentDbId } = await buildSurfacePayload(
    readiness,
    subjectId,
    assessmentKey,
    surface,
    payload.section_id,
  );

  const impressionEventError = await insertRemyEvent(readiness, {
    subjectId,
    assessmentDbId,
    eventType: "remy_impression",
    payload: {
      surface,
      section_id: payload.section_id || null,
      assessment_key: assessmentKey,
      nudge_id: response.nudge?.id || null,
      priority_ids: response.priorities.map((item) => item.id),
      explanation_ids: response.explanations.map((item) => item.id),
      generated_at: response.generated_at,
    },
  });

  if (impressionEventError) {
    console.error("[remy] impression event insert error:", impressionEventError);
  }

  return jsonResponse(response);
});
