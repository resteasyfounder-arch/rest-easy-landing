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
import {
  buildDeterministicChatReply,
  buildModelSystemPrompt,
  buildModelUserPrompt,
  normalizeChatTurnResponse,
  sanitizeInternalPath,
  type RemyChatContext,
  type RemyChatIntent,
  type RemyChatTurnResponse,
} from "./chatTurn.ts";
import {
  computeBackoffDelayMs,
  mapFailureFromStatus,
  mapSchemaFailure,
  mapTimeoutFailure,
  sanitizeProviderMode,
  shouldRetryStatus,
  shouldUseResponsesProvider,
  type ProviderFailure,
  type RemyFailureCode,
  type RemyResponseSource,
} from "./providerUtils.ts";

type RemyEventType =
  | "remy_impression"
  | "remy_dismiss_nudge"
  | "remy_ack_action"
  | "remy_chat_turn"
  | "remy_chat_response"
  | "remy_chat_fallback"
  | "remy_chat_error";

type RemyRequest = {
  action?: "get_surface_payload" | "dismiss_nudge" | "ack_action" | "chat_turn";
  assessment_id?: string;
  surface?: RemySurface;
  section_id?: string;
  nudge_id?: string;
  ttl_hours?: number;
  action_id?: string;
  target_href?: string;
  metadata?: Record<string, unknown>;
  conversation_id?: string;
  message?: string;
  context_hint?: string;
  client_turn_id?: string;
  client_request_id?: string;
};

type ReadinessClient = ReturnType<ReturnType<typeof createClient>["schema"]>;
type ChatHistoryItem = { role: "user" | "assistant"; text: string };
type ChatProvider = "chat_completions" | "responses_api";
type RemyErrorCode =
  | "CHAT_DISABLED"
  | "CHAT_MESSAGE_REQUIRED"
  | "CHAT_RATE_LIMITED"
  | "CHAT_STORAGE_UNAVAILABLE"
  | "CHAT_CONVERSATION_INIT_FAILED"
  | "CHAT_USER_MESSAGE_SAVE_FAILED"
  | "CHAT_PROVIDER_KEY_MISSING"
  | RemyFailureCode;

type ProviderInvocationResult = {
  response: RemyChatTurnResponse | null;
  provider: ChatProvider;
  openaiRequestId: string | null;
  providerResponseId: string | null;
  latencyMs: number;
  attempts: number;
  failure: ProviderFailure | null;
};

const CHAT_ENABLED = (Deno.env.get("REMY_CHAT_TURN_ENABLED") ?? "true").toLowerCase() !== "false";
const CHAT_RATE_LIMIT_PER_MIN = Math.min(
  60,
  Math.max(3, Number(Deno.env.get("REMY_CHAT_RATE_LIMIT_PER_MIN") ?? "12")),
);
const CHAT_MODEL_NAME = Deno.env.get("REMY_CHAT_MODEL") ?? "gpt-4o-mini";
const CHAT_PROVIDER_MODE = sanitizeProviderMode(Deno.env.get("REMY_CHAT_PROVIDER"));
const RESPONSES_CANARY_PERCENT = Math.max(0, Math.min(100, Number(Deno.env.get("REMY_RESPONSES_CANARY_PERCENT") ?? "0")));
const RESPONSE_STORE = (Deno.env.get("REMY_RESPONSE_STORE") ?? "false").toLowerCase() === "true";
const PROVIDER_TIMEOUT_MS = Math.max(1200, Number(Deno.env.get("REMY_CHAT_PROVIDER_TIMEOUT_MS") ?? "2800"));
const PROVIDER_MAX_RETRIES = Math.max(0, Math.min(2, Number(Deno.env.get("REMY_CHAT_PROVIDER_MAX_RETRIES") ?? "2")));
const PROVIDER_BACKOFF_BASE_MS = Math.max(60, Number(Deno.env.get("REMY_CHAT_PROVIDER_BACKOFF_MS") ?? "180"));
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

function sanitizeMessage(value: string | undefined, maxLen = 800): string | null {
  if (!value) return null;
  const normalized = value.replace(/\s+/g, " ").trim();
  if (!normalized) return null;
  return normalized.slice(0, maxLen);
}

function sanitizeConversationId(value: string | undefined): string | null {
  const id = sanitizeText(value, 64);
  if (!id) return null;
  if (!UUID_REGEX.test(id)) return null;
  return id;
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

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function sanitizeClientTraceId(value: string | undefined): string | null {
  const cleaned = sanitizeText(value, 120);
  if (!cleaned) return null;
  if (/[\r\n]/.test(cleaned)) return null;
  return cleaned;
}

function withAbortTimeout(timeoutMs: number) {
  const controller = new AbortController();
  const timeoutHandle = setTimeout(() => controller.abort("timeout"), timeoutMs);
  return {
    signal: controller.signal,
    clear: () => clearTimeout(timeoutHandle),
  };
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function errorResponse(
  traceId: string,
  code: RemyErrorCode,
  message: string,
  status: number,
  retryable: boolean,
  detail?: string,
) {
  return jsonResponse({
    error: {
      message,
      code,
      retryable,
      trace_id: traceId,
      detail: detail || null,
    },
  }, status);
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
    .select("id, status, report_status, report_stale, report_data, last_answer_at, overall_score")
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
      assessment: null,
      answers: [] as AnswerRow[],
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
    assessment,
    answers,
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

async function resolveConversationId(
  readiness: ReadinessClient,
  subjectId: string,
  conversationId?: string,
): Promise<{ id?: string; lastResponseId?: string | null; error?: string }> {
  const sanitizedConversationId = sanitizeConversationId(conversationId);
  if (sanitizedConversationId) {
    const { data: existing, error: existingError } = await readiness
      .from("remy_conversations")
      .select("id, openai_last_response_id")
      .eq("id", sanitizedConversationId)
      .eq("subject_id", subjectId)
      .maybeSingle();
    if (existingError) {
      return { error: existingError.message };
    }
    if (existing?.id) {
      return {
        id: existing.id as string,
        lastResponseId: (existing as { openai_last_response_id?: string | null }).openai_last_response_id ?? null,
      };
    }
  }

  const { data: created, error } = await readiness
    .from("remy_conversations")
    .insert({
      subject_id: subjectId,
      status: "active",
      openai_last_response_id: null,
    })
    .select("id, openai_last_response_id")
    .single();

  if (error) {
    return { error: error.message };
  }
  return {
    id: created.id as string,
    lastResponseId: (created as { openai_last_response_id?: string | null }).openai_last_response_id ?? null,
  };
}

async function setConversationLastResponseId(
  readiness: ReadinessClient,
  params: {
    conversationId: string;
    subjectId: string;
    lastResponseId: string;
  },
): Promise<string | null> {
  const { error } = await readiness
    .from("remy_conversations")
    .update({ openai_last_response_id: params.lastResponseId })
    .eq("id", params.conversationId)
    .eq("subject_id", params.subjectId);
  return error ? error.message : null;
}

async function isRateLimited(
  readiness: ReadinessClient,
  subjectId: string,
): Promise<boolean> {
  const windowStart = new Date(Date.now() - 60 * 1000).toISOString();
  const { count, error } = await readiness
    .from("remy_messages")
    .select("id", { head: true, count: "exact" })
    .eq("subject_id", subjectId)
    .eq("role", "user")
    .gte("created_at", windowStart);

  if (error) {
    console.error("[remy] rate limit query error:", error);
    return false;
  }

  return (count || 0) >= CHAT_RATE_LIMIT_PER_MIN;
}

async function insertConversationMessage(
  readiness: ReadinessClient,
  params: {
    conversationId: string;
    subjectId: string;
    role: "user" | "assistant" | "system";
    messageText: string;
    intent?: RemyChatIntent;
    metadata?: Record<string, unknown>;
    providerRequestId?: string | null;
    clientTurnId?: string | null;
  },
): Promise<{ id?: string; error?: string }> {
  const { data, error } = await readiness
    .from("remy_messages")
    .insert({
      conversation_id: params.conversationId,
      subject_id: params.subjectId,
      role: params.role,
      message_text: params.messageText,
      intent: params.intent || null,
      metadata: params.metadata || {},
      provider_request_id: params.providerRequestId || null,
      client_turn_id: params.clientTurnId || null,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  return { id: data.id as string };
}

async function loadConversationHistory(
  readiness: ReadinessClient,
  params: {
    conversationId: string;
    subjectId: string;
    limit?: number;
  },
): Promise<ChatHistoryItem[]> {
  const { data, error } = await readiness
    .from("remy_messages")
    .select("role, message_text, created_at")
    .eq("conversation_id", params.conversationId)
    .eq("subject_id", params.subjectId)
    .order("created_at", { ascending: false })
    .limit(params.limit || 8);

  if (error) {
    console.error("[remy] loadConversationHistory error:", error);
    return [];
  }

  return (data || [])
    .map((item) => ({
      role: item.role === "assistant" ? "assistant" : "user",
      text: String(item.message_text || ""),
      created_at: item.created_at as string,
    }))
    .reverse()
    .map(({ role, text }) => ({ role, text }));
}

async function assertChatStorageReady(readiness: ReadinessClient): Promise<string | null> {
  const { error } = await readiness.from("remy_conversations").select("id", { head: true, count: "exact" });
  return error ? error.message : null;
}

const REMY_CHAT_JSON_SCHEMA = {
  type: "object",
  properties: {
    assistant_message: { type: "string" },
    quick_replies: {
      type: "array",
      items: { type: "string" },
    },
    cta: {
      type: ["object", "null"],
      properties: {
        id: { type: "string" },
        label: { type: "string" },
        href: { type: "string" },
      },
      required: ["id", "label", "href"],
      additionalProperties: false,
    },
    why_this: {
      type: ["object", "null"],
      properties: {
        title: { type: "string" },
        body: { type: "string" },
        source_refs: {
          type: "array",
          items: { type: "string" },
        },
      },
      required: ["title", "body", "source_refs"],
      additionalProperties: false,
    },
    intent: {
      type: "string",
      enum: ["clarify", "prioritize", "explain_score", "plan_next", "reassure", "unknown"],
    },
    confidence: { type: "number" },
    safety_flags: {
      type: "array",
      items: { type: "string" },
    },
  },
  required: [
    "assistant_message",
    "quick_replies",
    "cta",
    "why_this",
    "intent",
    "confidence",
    "safety_flags",
  ],
  additionalProperties: false,
};

function extractResponsePayload(raw: unknown): unknown | null {
  if (!raw || typeof raw !== "object") return null;
  const payload = raw as Record<string, unknown>;

  if (payload.output_parsed && typeof payload.output_parsed === "object") {
    return payload.output_parsed;
  }

  if (typeof payload.output_text === "string") {
    try {
      return JSON.parse(payload.output_text);
    } catch {
      return null;
    }
  }

  const output = Array.isArray(payload.output) ? payload.output : [];
  for (const item of output) {
    if (!item || typeof item !== "object") continue;
    const message = item as Record<string, unknown>;
    const content = Array.isArray(message.content) ? message.content : [];
    for (const part of content) {
      if (!part || typeof part !== "object") continue;
      const fragment = part as Record<string, unknown>;
      if (fragment.parsed && typeof fragment.parsed === "object") {
        return fragment.parsed;
      }
      if (typeof fragment.text === "string") {
        try {
          return JSON.parse(fragment.text);
        } catch {
          continue;
        }
      }
    }
  }

  return null;
}

async function invokeChatCompletionsProvider(
  apiKey: string,
  context: RemyChatContext,
  history: ChatHistoryItem[],
  fallback: RemyChatTurnResponse,
  clientRequestId: string,
): Promise<ProviderInvocationResult> {
  const startedAt = Date.now();
  const maxAttempts = PROVIDER_MAX_RETRIES + 1;
  let attempts = 0;
  let lastFailure: ProviderFailure | null = null;
  let lastOpenAiRequestId: string | null = null;

  for (attempts = 1; attempts <= maxAttempts; attempts += 1) {
    const timeout = withAbortTimeout(PROVIDER_TIMEOUT_MS);
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "X-Client-Request-Id": clientRequestId,
        },
        signal: timeout.signal,
        body: JSON.stringify({
          model: CHAT_MODEL_NAME,
          messages: [
            { role: "system", content: buildModelSystemPrompt() },
            { role: "user", content: buildModelUserPrompt(context, history) },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "remy_chat_turn",
                description: "Create a safe, personalized Remy chat turn for Rest Easy.",
                strict: true,
                parameters: REMY_CHAT_JSON_SCHEMA,
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "remy_chat_turn" },
          },
          temperature: 0.35,
        }),
      });
      timeout.clear();
      lastOpenAiRequestId = response.headers.get("x-request-id");

      if (!response.ok) {
        const details = await response.text();
        lastFailure = mapFailureFromStatus(response.status, details.slice(0, 500));
        if (attempts < maxAttempts && shouldRetryStatus(response.status)) {
          await sleep(computeBackoffDelayMs(attempts, PROVIDER_BACKOFF_BASE_MS));
          continue;
        }
        break;
      }

      const data = await response.json();
      const toolCall = data?.choices?.[0]?.message?.tool_calls?.[0];
      if (!toolCall?.function?.arguments) {
        lastFailure = mapSchemaFailure("No tool-call payload in chat completions response");
        break;
      }

      try {
        const modelPayload = JSON.parse(toolCall.function.arguments);
        return {
          response: normalizeChatTurnResponse(modelPayload, fallback),
          provider: "chat_completions",
          openaiRequestId: lastOpenAiRequestId,
          providerResponseId: null,
          latencyMs: Date.now() - startedAt,
          attempts,
          failure: null,
        };
      } catch {
        lastFailure = mapSchemaFailure("Unable to parse chat completions function arguments");
        break;
      }
    } catch (error) {
      timeout.clear();
      const isAbort = error instanceof Error && error.name === "AbortError";
      if (isAbort) {
        lastFailure = mapTimeoutFailure(`Provider timeout after ${PROVIDER_TIMEOUT_MS}ms`);
      } else {
        lastFailure = {
          code: "OPENAI_PROVIDER_ERROR",
          retryable: true,
          detail: error instanceof Error ? error.message : "Unknown provider network error",
        };
      }

      if (attempts < maxAttempts && lastFailure.retryable) {
        await sleep(computeBackoffDelayMs(attempts, PROVIDER_BACKOFF_BASE_MS));
        continue;
      }
      break;
    }
  }

  return {
    response: null,
    provider: "chat_completions",
    openaiRequestId: lastOpenAiRequestId,
    providerResponseId: null,
    latencyMs: Date.now() - startedAt,
    attempts: attempts || maxAttempts,
    failure: lastFailure ?? {
      code: "OPENAI_PROVIDER_ERROR",
      retryable: false,
      detail: "Unknown chat completions provider failure",
    },
  };
}

async function invokeResponsesProvider(
  apiKey: string,
  context: RemyChatContext,
  history: ChatHistoryItem[],
  fallback: RemyChatTurnResponse,
  clientRequestId: string,
  previousResponseId: string | null,
): Promise<ProviderInvocationResult> {
  const startedAt = Date.now();
  const maxAttempts = PROVIDER_MAX_RETRIES + 1;
  let attempts = 0;
  let lastFailure: ProviderFailure | null = null;
  let lastOpenAiRequestId: string | null = null;
  let providerResponseId: string | null = null;

  for (attempts = 1; attempts <= maxAttempts; attempts += 1) {
    const timeout = withAbortTimeout(PROVIDER_TIMEOUT_MS);
    try {
      const response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "X-Client-Request-Id": clientRequestId,
        },
        signal: timeout.signal,
        body: JSON.stringify({
          model: CHAT_MODEL_NAME,
          store: RESPONSE_STORE,
          previous_response_id: previousResponseId || undefined,
          instructions: buildModelSystemPrompt(),
          input: [
            {
              role: "user",
              content: buildModelUserPrompt(context, history),
            },
          ],
          text: {
            format: {
              type: "json_schema",
              name: "remy_chat_turn",
              strict: true,
              schema: REMY_CHAT_JSON_SCHEMA,
            },
          },
          temperature: 0.35,
        }),
      });
      timeout.clear();
      lastOpenAiRequestId = response.headers.get("x-request-id");

      if (!response.ok) {
        const details = await response.text();
        lastFailure = mapFailureFromStatus(response.status, details.slice(0, 500));
        if (attempts < maxAttempts && shouldRetryStatus(response.status)) {
          await sleep(computeBackoffDelayMs(attempts, PROVIDER_BACKOFF_BASE_MS));
          continue;
        }
        break;
      }

      const data = await response.json();
      providerResponseId = typeof data?.id === "string" ? data.id : null;
      const parsedPayload = extractResponsePayload(data);
      if (!parsedPayload) {
        lastFailure = mapSchemaFailure("Unable to parse responses API structured output");
        break;
      }

      return {
        response: normalizeChatTurnResponse(parsedPayload, fallback),
        provider: "responses_api",
        openaiRequestId: lastOpenAiRequestId,
        providerResponseId,
        latencyMs: Date.now() - startedAt,
        attempts,
        failure: null,
      };
    } catch (error) {
      timeout.clear();
      const isAbort = error instanceof Error && error.name === "AbortError";
      if (isAbort) {
        lastFailure = mapTimeoutFailure(`Provider timeout after ${PROVIDER_TIMEOUT_MS}ms`);
      } else {
        lastFailure = {
          code: "OPENAI_PROVIDER_ERROR",
          retryable: true,
          detail: error instanceof Error ? error.message : "Unknown provider network error",
        };
      }
      if (attempts < maxAttempts && lastFailure.retryable) {
        await sleep(computeBackoffDelayMs(attempts, PROVIDER_BACKOFF_BASE_MS));
        continue;
      }
      break;
    }
  }

  return {
    response: null,
    provider: "responses_api",
    openaiRequestId: lastOpenAiRequestId,
    providerResponseId,
    latencyMs: Date.now() - startedAt,
    attempts: attempts || maxAttempts,
    failure: lastFailure ?? {
      code: "OPENAI_PROVIDER_ERROR",
      retryable: false,
      detail: "Unknown responses provider failure",
    },
  };
}

async function invokeProviderForTurn(
  apiKey: string,
  context: RemyChatContext,
  history: ChatHistoryItem[],
  fallback: RemyChatTurnResponse,
  clientRequestId: string,
  previousResponseId: string | null,
): Promise<ProviderInvocationResult> {
  const routingKey = `${context.conversationId}:${context.assessmentKey}:${context.surface}`;
  const useResponses = shouldUseResponsesProvider(
    CHAT_PROVIDER_MODE,
    RESPONSES_CANARY_PERCENT,
    routingKey,
  );

  if (useResponses) {
    return invokeResponsesProvider(
      apiKey,
      context,
      history,
      fallback,
      clientRequestId,
      previousResponseId,
    );
  }
  return invokeChatCompletionsProvider(apiKey, context, history, fallback, clientRequestId);
}

serve(async (req) => {
  const traceId = sanitizeClientTraceId(req.headers.get("x-client-request-id") ?? undefined) || crypto.randomUUID();

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

  if (action === "chat_turn") {
    if (!CHAT_ENABLED) {
      return errorResponse(traceId, "CHAT_DISABLED", "chat_turn is currently disabled", 403, false);
    }

    const surface = payload.surface || "dashboard";
    const message = sanitizeMessage(payload.message, 800);
    if (!message) {
      return errorResponse(traceId, "CHAT_MESSAGE_REQUIRED", "message is required", 400, false);
    }

    const contextHint = sanitizeText(payload.context_hint, 160);
    const clientTurnId = sanitizeText(payload.client_turn_id, 120);
    const clientRequestId = sanitizeClientTraceId(payload.client_request_id) || traceId;
    const storageError = await assertChatStorageReady(readiness);
    if (storageError) {
      return errorResponse(
        traceId,
        "CHAT_STORAGE_UNAVAILABLE",
        "Remy chat storage is unavailable",
        500,
        false,
        storageError,
      );
    }

    const isLimited = await isRateLimited(readiness, subjectId);
    if (isLimited) {
      return errorResponse(traceId, "CHAT_RATE_LIMITED", "Rate limit exceeded for chat_turn", 429, true);
    }

    const { payload: surfacePayload, assessmentDbId, assessment, answers } = await buildSurfacePayload(
      readiness,
      subjectId,
      assessmentKey,
      surface,
      payload.section_id,
    );

    const conversation = await resolveConversationId(readiness, subjectId, payload.conversation_id);
    if (!conversation.id) {
      console.error("[remy] unable to resolve conversation:", conversation.error);
      return errorResponse(
        traceId,
        "CHAT_CONVERSATION_INIT_FAILED",
        "Unable to initialize Remy conversation",
        500,
        true,
        conversation.error,
      );
    }

    const chatContext: RemyChatContext = {
      conversationId: conversation.id,
      assessmentKey,
      surface,
      message: contextHint ? `${message} (${contextHint})` : message,
      assessment,
      payload: surfacePayload,
      answerCount: answers.length,
    };

    const fallback = buildDeterministicChatReply(chatContext);
    const chatTurnEvent = await insertRemyEvent(readiness, {
      subjectId,
      assessmentDbId,
      eventType: "remy_chat_turn",
      payload: {
        surface,
        trace_id: traceId,
        provider_mode: CHAT_PROVIDER_MODE,
        responses_canary_percent: RESPONSES_CANARY_PERCENT,
        client_turn_id: clientTurnId || null,
        client_request_id: clientRequestId,
        conversation_id: conversation.id,
        message_length: message.length,
      },
    });
    if (chatTurnEvent) {
      console.error("[remy] chat_turn event insert error:", chatTurnEvent);
    }

    const userMessageInsert = await insertConversationMessage(readiness, {
      conversationId: conversation.id,
      subjectId,
      role: "user",
      messageText: message,
      clientTurnId,
      metadata: {
        surface,
        context_hint: contextHint,
        trace_id: traceId,
      },
    });
    if (userMessageInsert.error) {
      console.error("[remy] chat_turn user message insert error:", userMessageInsert.error);
      return errorResponse(
        traceId,
        "CHAT_USER_MESSAGE_SAVE_FAILED",
        "Unable to save user message",
        500,
        true,
        userMessageInsert.error,
      );
    }

    let response = fallback;
    let fallbackReason = "deterministic";
    let providerSource: RemyResponseSource = "deterministic_fallback";
    let providerName: ChatProvider = "chat_completions";
    let providerAttempts = 0;
    let providerLatencyMs = 0;
    let providerRequestId: string | null = null;
    let providerResponseId: string | null = null;
    let providerFailureCode: ProviderFailure["code"] | null = null;
    let providerFailureDetail: string | null = null;

    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (apiKey) {
      const history = await loadConversationHistory(readiness, {
        conversationId: conversation.id,
        subjectId,
        limit: 10,
      });
      const providerResult = await invokeProviderForTurn(
        apiKey,
        chatContext,
        history,
        fallback,
        clientRequestId,
        conversation.lastResponseId || null,
      );
      providerName = providerResult.provider;
      providerAttempts = providerResult.attempts;
      providerLatencyMs = providerResult.latencyMs;
      providerRequestId = providerResult.openaiRequestId;
      providerResponseId = providerResult.providerResponseId;
      providerFailureCode = providerResult.failure?.code || null;
      providerFailureDetail = providerResult.failure?.detail || null;

      if (providerResult.response) {
        response = providerResult.response;
        fallbackReason = "";
        providerSource = providerResult.provider;
        if (providerResult.provider === "responses_api" && providerResult.providerResponseId) {
          const setIdError = await setConversationLastResponseId(readiness, {
            conversationId: conversation.id,
            subjectId,
            lastResponseId: providerResult.providerResponseId,
          });
          if (setIdError) {
            console.error("[remy] setConversationLastResponseId error:", setIdError);
          }
        }
      } else {
        fallbackReason = providerResult.failure?.code || "model_invalid";
      }
    } else {
      fallbackReason = "model_key_missing";
      providerFailureCode = "OPENAI_PROVIDER_ERROR";
      providerFailureDetail = "OPENAI_API_KEY is not configured";
    }

    if (fallbackReason && fallbackReason !== "deterministic") {
      const chatErrorEvent = await insertRemyEvent(readiness, {
        subjectId,
        assessmentDbId,
        eventType: "remy_chat_error",
        payload: {
          trace_id: traceId,
          conversation_id: conversation.id,
          provider: providerName,
          code: providerFailureCode || fallbackReason,
          detail: providerFailureDetail || fallbackReason,
          retryable: providerFailureCode
            ? providerFailureCode === "OPENAI_RATE_LIMIT" ||
              providerFailureCode === "OPENAI_SERVER_ERROR" ||
              providerFailureCode === "OPENAI_TIMEOUT"
            : false,
        },
      });
      if (chatErrorEvent) {
        console.error("[remy] remy_chat_error insert error:", chatErrorEvent);
      }
    }

    const responseMessageInsert = await insertConversationMessage(readiness, {
      conversationId: conversation.id,
      subjectId,
      role: "assistant",
      messageText: response.assistant_message,
      intent: response.intent,
      providerRequestId,
      clientTurnId,
      metadata: {
        trace_id: traceId,
        provider: providerName,
        openai_request_id: providerRequestId,
        provider_response_id: providerResponseId,
        provider_attempt_count: providerAttempts,
        provider_latency_ms: providerLatencyMs,
        provider_failure_code: providerFailureCode,
        provider_failure_detail: providerFailureDetail,
        confidence: response.confidence,
        safety_flags: response.safety_flags,
        cta: response.cta || null,
        why_this: response.why_this || null,
        model_name: fallbackReason ? null : CHAT_MODEL_NAME,
        fallback_reason: fallbackReason || null,
      },
    });

    if (responseMessageInsert.error) {
      console.error("[remy] assistant message insert error:", responseMessageInsert.error);
    }

    const eventType: RemyEventType = fallbackReason ? "remy_chat_fallback" : "remy_chat_response";
    const eventError = await insertRemyEvent(readiness, {
      subjectId,
      assessmentDbId,
      eventType,
      payload: {
        trace_id: traceId,
        conversation_id: conversation.id,
        provider: providerName,
        openai_request_id: providerRequestId,
        provider_response_id: providerResponseId,
        provider_attempt_count: providerAttempts,
        provider_latency_ms: providerLatencyMs,
        provider_failure_code: providerFailureCode,
        intent: response.intent,
        confidence: response.confidence,
        safety_flags: response.safety_flags,
        fallback_reason: fallbackReason || null,
        model_name: fallbackReason ? null : CHAT_MODEL_NAME,
      },
    });
    if (eventError) {
      console.error(`[remy] ${eventType} insert error:`, eventError);
    }

    return jsonResponse({
      ...response,
      meta: {
        trace_id: traceId,
        response_source: providerSource,
        degraded_reason: fallbackReason || undefined,
      },
    });
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
