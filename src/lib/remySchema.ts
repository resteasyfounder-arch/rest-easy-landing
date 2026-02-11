import { z } from "zod";
import type { RemyChatTurnResponse, RemySurfacePayload } from "@/types/remy";

const remySurfaceEnum = z.enum(["dashboard", "readiness", "section_summary", "results", "profile", "menu", "vault"]);
const remyPriorityEnum = z.enum(["HIGH", "MEDIUM", "LOW"]);

const remyNudgeSchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string(),
  cta: z
    .object({
      label: z.string(),
      href: z.string(),
    })
    .optional(),
});

const remyExplanationSchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string(),
  source_refs: z.array(z.string()),
});

const remyPriorityItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  priority: remyPriorityEnum,
  why_now: z.string(),
  target_href: z.string(),
});

const remyReassuranceSchema = z.object({
  title: z.string(),
  body: z.string(),
});

const remyChatIntentEnum = z.enum([
  "clarify",
  "prioritize",
  "explain_score",
  "plan_next",
  "reassure",
  "unknown",
]);

const remyChatCtaSchema = z.object({
  id: z.string(),
  label: z.string(),
  href: z.string().startsWith("/"),
});

const remyWhyThisSchema = z.object({
  title: z.string(),
  body: z.string(),
  source_refs: z.array(z.string()),
});

const remyChatMetaSchema = z.object({
  trace_id: z.string().min(1),
  response_source: z.enum(["responses_api", "chat_completions", "deterministic_fallback"]),
  degraded_reason: z.string().optional(),
  goal: z
    .enum([
      "greeting",
      "score_explain",
      "next_step",
      "skip_priority",
      "route_to_question",
      "question_lookup",
      "vault_progress",
      "vault_upload_route",
      "report_summary",
      "report_strengths",
      "ui_wayfinding",
      "clarification",
      "out_of_scope",
    ])
    .optional(),
  score_band: z
    .enum(["early_readiness", "developing_readiness", "advancing_readiness", "near_full_readiness", "score_unavailable"])
    .optional(),
  policy_mode: z.literal("app_directed_only").optional(),
  capability: z.enum(["readiness", "vault", "report", "navigation"]).optional(),
  route_type: z.enum(["readiness_question", "vault_upload", "vault_edit", "app_section"]).optional(),
  grounding_passed: z.boolean().optional(),
});

export const remySurfacePayloadSchema = z.object({
  surface: remySurfaceEnum,
  generated_at: z.string(),
  domain_scope: z.literal("rest_easy_readiness"),
  nudge: remyNudgeSchema.nullable(),
  explanations: z.array(remyExplanationSchema),
  priorities: z.array(remyPriorityItemSchema),
  reassurance: remyReassuranceSchema,
});

export const remyChatTurnResponseSchema = z.object({
  conversation_id: z.string(),
  assistant_message: z.string(),
  quick_replies: z.array(z.string()).max(3),
  cta: remyChatCtaSchema.optional(),
  why_this: remyWhyThisSchema.optional(),
  intent: remyChatIntentEnum,
  confidence: z.number().min(0).max(1),
  safety_flags: z.array(z.string()),
  meta: remyChatMetaSchema,
});

export function parseRemySurfacePayload(data: unknown): RemySurfacePayload {
  return remySurfacePayloadSchema.parse(data) as RemySurfacePayload;
}

export function parseRemyChatTurnResponse(data: unknown): RemyChatTurnResponse {
  return remyChatTurnResponseSchema.parse(data) as RemyChatTurnResponse;
}
