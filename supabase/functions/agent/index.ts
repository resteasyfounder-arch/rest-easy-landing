import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.1";

type AnswerValue = "yes" | "partial" | "no" | "not_sure" | "na";

type AgentAnswerInput = {
  question_id: string;
  item_id: string;
  section_id: string;
  dimension: string;
  answer_value: AnswerValue;
  answer_label?: string;
  score_fraction?: number;
  confidence?: number;
  question_text?: string;
  question_meta?: Record<string, unknown>;
};

type AgentRequest = {
  action?: "get_schema";
  subject_id?: string;
  user_id?: string;
  assessment_id?: string;
  schema_version?: string;
  profile?: {
    profile_json?: Record<string, unknown>;
    confidence_json?: Record<string, unknown>;
    version?: string;
  };
  answers?: AgentAnswerInput[];
  assessment?: {
    overall_score?: number;
    dimension_scores?: Record<string, number>;
    status?: "draft" | "completed";
    current_step?: number;
    current_section?: string;
  };
  message?: {
    text?: string;
  };
};

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
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

  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ error: "Missing Supabase environment configuration" }, 500);
  }

  let payload: AgentRequest;
  try {
    payload = await req.json();
  } catch (_err) {
    return jsonResponse({ error: "Invalid JSON payload" }, 400);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
  const readiness = supabase.schema("readiness_v1");

  if (payload.action === "get_schema") {
    const assessmentKey = payload.assessment_id ?? "readiness_v1";
    const schemaVersion = payload.schema_version ?? "v1";
    const { data, error } = await readiness
      .from("assessment_schemas")
      .select("schema_json, version")
      .eq("assessment_id", assessmentKey)
      .eq("version", schemaVersion)
      .maybeSingle();

    if (error) {
      return jsonResponse({ error: "Failed to load schema" }, 500);
    }
    if (!data?.schema_json) {
      return jsonResponse({ error: "Schema not found" }, 404);
    }

    return jsonResponse({
      assessment_id: assessmentKey,
      version: data.version,
      schema: data.schema_json,
    });
  }

  const subjectResult = await ensureSubject(readiness, payload);
  if (!subjectResult.id) {
    return jsonResponse(
      { error: "Unable to resolve subject", detail: subjectResult.error ?? "unknown" },
      500
    );
  }

  const assessmentResult = await ensureAssessment(
    readiness,
    subjectResult.id,
    payload.assessment_id
  );
  if (!assessmentResult.id) {
    return jsonResponse(
      { error: "Unable to resolve assessment", detail: assessmentResult.error ?? "unknown" },
      500
    );
  }

  if (payload.profile) {
    const profileRow = {
      subject_id: subjectResult.id,
      profile_json: payload.profile.profile_json ?? {},
      confidence_json: payload.profile.confidence_json ?? {},
      version: payload.profile.version ?? "v1",
    };

    const { error: profileError } = await readiness
      .from("profile_intake")
      .upsert(profileRow, { onConflict: "subject_id" });

    if (profileError) {
      return jsonResponse({ error: "Failed to save profile" }, 500);
    }
  }

  if (payload.answers && payload.answers.length > 0) {
    const answerRows = payload.answers.map((answer) => ({
      assessment_id: assessmentResult.id,
      subject_id: subjectResult.id,
      question_id: answer.question_id,
      item_id: answer.item_id,
      section_id: answer.section_id,
      dimension: answer.dimension,
      answer_value: answer.answer_value,
      answer_label: answer.answer_label ?? null,
      score_fraction: answer.score_fraction ?? null,
      confidence: answer.confidence ?? null,
      question_text: answer.question_text ?? null,
      question_meta: answer.question_meta ?? {},
    }));

    const { error: answersError } = await readiness
      .from("assessment_answers")
      .upsert(answerRows, { onConflict: "assessment_id,question_id" });

    if (answersError) {
      return jsonResponse({ error: "Failed to save answers" }, 500);
    }
  }

  if (payload.assessment) {
    const updates: Record<string, unknown> = {};
    if (payload.assessment.overall_score !== undefined) {
      updates.overall_score = payload.assessment.overall_score;
    }
    if (payload.assessment.dimension_scores) {
      updates.dimension_scores = payload.assessment.dimension_scores;
    }
    if (payload.assessment.status) {
      updates.status = payload.assessment.status;
    }
    if (payload.assessment.current_step !== undefined) {
      updates.current_step = payload.assessment.current_step;
    }
    if (payload.assessment.current_section) {
      updates.current_section = payload.assessment.current_section;
    }

    if (Object.keys(updates).length > 0) {
      const { error: assessmentError } = await readiness
        .from("assessments")
        .update(updates)
        .eq("id", assessmentResult.id);

      if (assessmentError) {
        return jsonResponse({ error: "Failed to update assessment" }, 500);
      }
    }
  }

  return jsonResponse({
    subject_id: subjectResult.id,
    assessment_id: assessmentResult.id,
    assistant_message: "Thanks. Your readiness progress is saved.",
    next_questions: [],
    suggested_actions: [],
    risk_flags: [],
    needs_score_regen: Boolean(payload.answers && payload.answers.length > 0),
  });
});

async function ensureSubject(
  readiness: ReturnType<ReturnType<typeof createClient>["schema"]>,
  payload: AgentRequest
): Promise<{ id?: string; error?: string }> {
  if (payload.subject_id) {
    const { data: existing, error } = await readiness
      .from("subjects")
      .select("id")
      .eq("id", payload.subject_id)
      .maybeSingle();

    if (error) {
      return { error: error.message };
    }

    if (existing?.id) {
      return { id: existing.id };
    }
  }

  if (payload.user_id) {
    const { data: upserted, error } = await readiness
      .from("subjects")
      .upsert({ kind: "user", user_id: payload.user_id }, { onConflict: "user_id" })
      .select("id")
      .single();

    if (error) {
      return { error: error.message };
    }

    return { id: upserted.id };
  }

  const { data: created, error: createError } = await readiness
    .from("subjects")
    .insert({ kind: "guest" })
    .select("id")
    .single();

  if (createError) {
    return { error: createError.message };
  }

  return { id: created.id };
}

async function ensureAssessment(
  readiness: ReturnType<ReturnType<typeof createClient>["schema"]>,
  subjectId: string,
  assessmentId?: string
): Promise<{ id?: string; error?: string }> {
  const assessmentKey = assessmentId ?? "readiness_v1";

  const { data: existing } = await readiness
    .from("assessments")
    .select("id")
    .eq("subject_id", subjectId)
    .eq("assessment_id", assessmentKey)
    .eq("status", "draft")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing?.id) {
    return { id: existing.id };
  }

  const { data: created, error } = await readiness
    .from("assessments")
    .insert({
      subject_id: subjectId,
      assessment_id: assessmentKey,
      schema_version: "v1",
      status: "draft",
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  return { id: created.id };
}
