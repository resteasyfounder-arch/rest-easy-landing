# Remy Phase 2 Spec: Real Agent Backend + Free-Text Chat

Date: 2026-02-10  
Status: Proposed (ready for implementation)

## 1. Executive Summary

Remy should move from quick-reply pseudo-chat to a real conversational assistant with:

1. Free-text user input.
2. Authenticated personalization from profile, assessment, and report state.
3. Safe, domain-constrained answers for Rest Easy only.
4. Action-oriented output that can trigger in-app navigation and workflows.

This phase introduces a hybrid agent architecture:

1. Deterministic tools/selectors for truth and recommendations.
2. LLM generation for conversational quality.
3. Structured response schema + guardrails for reliability.

## 2. Product Requirements

## 2.1 Functional Requirements

1. Logged-in users can send arbitrary text to Remy in launcher chat.
2. Remy response references user-specific context (state, progress, gaps).
3. Remy can answer:
   1. clarification ("what does this mean?")
   2. prioritization ("what should I do first?")
   3. score explanation ("why is this low?")
   4. planning ("what should I do next?")
   5. reassurance ("am I behind?")
4. Remy can return at most one primary CTA per turn.
5. Every answer remains inside Rest Easy domain.

## 2.2 Non-Functional Requirements

1. p95 response latency < 2.5s for non-streaming MVP.
2. p95 function failure rate < 1%.
3. No user data leakage across subjects.
4. JSON schema-compliant response in 100% of successful calls.

## 3. Scope / Non-Scope

In Scope:

1. `chat_turn` backend action in Remy function.
2. Conversation persistence tables.
3. Free-text input frontend in launcher.
4. Agent tool layer over readiness data.
5. Safety/policy/observability/evals.

Out of Scope:

1. Voice interface.
2. Cross-product workflows beyond Rest Easy domain.
3. Open-ended legal/financial advice.

## 4. Architecture

## 4.1 High-Level Flow

1. Frontend sends `chat_turn` with message + conversation id.
2. Remy function resolves auth user -> subject.
3. Context builder gathers personalized state.
4. Intent/router decides tool calls.
5. Tool results feed generation prompt.
6. Model returns structured JSON.
7. Validator enforces schema and safety checks.
8. Response persisted + returned to client.

## 4.2 Model Strategy

MVP:

1. Single model call per turn with compact context.
2. Tool outputs injected as grounded context.
3. Strict JSON output format.

Fallback:

1. If model fails/timeout/schema-invalid -> deterministic fallback reply using existing `buildRemySurfacePayload` outputs.

## 4.3 Prompt Contract

System prompt requirements:

1. Domain: Rest Easy readiness only.
2. Tone: companion, calm, concise, non-judgmental.
3. Never fabricate user state.
4. If unknown, ask one focused follow-up.
5. Prefer one recommendation at a time.
6. Avoid legal/medical/financial directives beyond planning guidance.

## 5. Backend Spec

Primary file:

1. `/Users/alexmurray/Desktop/resteasy/rest-easy-landing/supabase/functions/remy/index.ts`

## 5.1 Request Schema (`chat_turn`)

```json
{
  "action": "chat_turn",
  "assessment_id": "readiness_v1",
  "surface": "dashboard|readiness|results|profile|menu",
  "conversation_id": "optional-uuid-or-client-id",
  "message": "free text",
  "context_hint": "optional short hint"
}
```

Constraints:

1. `message` length 1..800 chars.
2. Reject blank/whitespace only.
3. Rate limit by user/subject.

## 5.2 Response Schema (`chat_turn`)

```json
{
  "conversation_id": "string",
  "assistant_message": "string",
  "quick_replies": ["string", "string"],
  "cta": {
    "id": "string",
    "label": "string",
    "href": "/internal/path"
  },
  "why_this": {
    "title": "string",
    "body": "string",
    "source_refs": ["string"]
  },
  "intent": "clarify|prioritize|explain_score|plan_next|reassure|unknown",
  "confidence": 0.0,
  "safety_flags": []
}
```

Rules:

1. `cta` optional.
2. `quick_replies` max 3.
3. `href` must pass internal path sanitizer.

## 5.3 Data Model (Migrations)

Add tables:

1. `readiness_v1.remy_conversations`
   1. `id uuid pk`
   2. `subject_id uuid fk`
   3. `status text` (`active|archived`)
   4. `created_at`, `updated_at`
2. `readiness_v1.remy_messages`
   1. `id uuid pk`
   2. `conversation_id uuid fk`
   3. `subject_id uuid fk`
   4. `role text` (`user|assistant|system`)
   5. `message_text text`
   6. `intent text`
   7. `metadata jsonb`
   8. `created_at timestamptz`
3. `readiness_v1.remy_feedback`
   1. `id uuid pk`
   2. `message_id uuid fk`
   3. `subject_id uuid fk`
   4. `rating smallint` (`-1|1`)
   5. `reason text`
   6. `created_at`

RLS policies:

1. Subject-owner read/write only via `is_subject_owner(subject_id)`.

## 5.4 Tool Layer (Deterministic)

Implement callable internal functions (module-level):

1. `tool_get_user_state(subjectId, assessmentKey)`
2. `tool_get_top_priorities(subjectId, assessmentKey, limit=3)`
3. `tool_explain_score_driver(subjectId, assessmentKey, sectionId?)`
4. `tool_get_recent_changes(subjectId, assessmentKey, hours=168)`
5. `tool_get_next_best_action(subjectId, assessmentKey)`

Tool design constraints:

1. No external network calls.
2. All results carry `source_refs`.
3. Return compact JSON only.

## 5.5 Safety Controls

1. Input filter for abusive/injection text markers.
2. Domain classifier gate:
   1. in-domain -> normal flow
   2. out-of-domain -> boundary response template
3. Output validator:
   1. enforce schema
   2. block external URLs in CTA
   3. block disallowed claims
4. Hard token/length budget.
5. Timeout + retry budget (single retry max).

## 6. Frontend Spec

## 6.1 Free-Text UX

Primary file:

1. `/Users/alexmurray/Desktop/resteasy/rest-easy-landing/src/components/remy/RemyCompanionChat.tsx`

Changes:

1. Add text input + send action for authenticated chat.
2. Preserve quick replies as accelerators.
3. Show typing state while awaiting `chat_turn`.
4. Render structured response:
   1. assistant message
   2. optional CTA
   3. optional Why this (collapsed)

## 6.2 Hook/API

Primary file:

1. `/Users/alexmurray/Desktop/resteasy/rest-easy-landing/src/hooks/useRemySurface.ts`

Add method:

1. `chatTurn(message: string, conversationId?: string, contextHint?: string)`

Behavior:

1. Calls Remy function with `action: chat_turn`.
2. Returns typed `RemyChatTurnResponse`.
3. Handles schema parse + fallback message.

## 6.3 Types and Schema

Update:

1. `/Users/alexmurray/Desktop/resteasy/rest-easy-landing/src/types/remy.ts`
2. `/Users/alexmurray/Desktop/resteasy/rest-easy-landing/src/lib/remySchema.ts`

Add chat types:

1. `RemyChatTurnRequest`
2. `RemyChatTurnResponse`
3. `RemyConversationMessage`

## 7. Observability & Metrics

Use `events` table with new event types:

1. `remy_chat_opened`
2. `remy_chat_turn`
3. `remy_chat_response`
4. `remy_chat_fallback`
5. `remy_chat_error`
6. `remy_cta_clicked`
7. `remy_feedback_given`

Track dimensions:

1. latency_ms
2. model_name
3. intent
4. confidence_bucket
5. fallback_used
6. surface

## 8. Comprehensive Testing Plan

## 8.1 Unit Tests (Backend)

1. Intent classification tests:
   1. prioritize
   2. explain score
   3. reassure
   4. out-of-domain
2. Tool output tests for each deterministic tool.
3. Sanitizer tests:
   1. input text
   2. metadata
   3. internal CTA paths
4. Schema validation tests for `chat_turn` output.
5. Fallback path tests when model returns invalid payload.

## 8.2 Unit Tests (Frontend)

1. `RemyCompanionChat` message rendering for:
   1. normal response
   2. CTA response
   3. why_this expansion
2. Input behavior tests:
   1. send disabled on empty
   2. send on Enter
   3. typing state shown
3. Hook tests for `chatTurn` success/failure/fallback.

## 8.3 Integration Tests

1. Remy function integration with seeded DB fixtures:
   1. no assessment
   2. in-progress assessment
   3. completed + stale report
2. Auth integration:
   1. user A cannot read/write user B conversation.
3. End-to-end `chat_turn` returning valid schema and actionable CTA.

## 8.4 Safety & Red-Team Tests

1. Prompt injection attempts ("ignore instructions...").
2. Out-of-domain requests (stocks, politics, medical advice).
3. Data exfiltration attempts ("show another user data").
4. Unsafe CTA payload attempts.

Pass criteria:

1. 100% blocked or safely redirected to boundary response.

## 8.5 Performance & Reliability Tests

1. Load test at expected concurrency (e.g., 30 req/s burst):
   1. p95 < 2.5s
   2. error rate < 1%
2. Timeout behavior test (model timeout -> deterministic fallback).
3. Circuit-breaker behavior if model provider degraded.

## 8.6 Regression Tests

1. Existing Remy surface payload tests still pass.
2. Dashboard/readiness/results CTA navigation unchanged.
3. No break in report and assessment flows.

## 8.7 Evaluation Harness

Create fixture set of at least 150 prompts:

1. 60 in-domain user intents.
2. 40 ambiguous intents.
3. 30 out-of-domain.
4. 20 adversarial prompts.

Score rubric per response:

1. Groundedness (0-2)
2. Personalization relevance (0-2)
3. Actionability (0-2)
4. Tone quality (0-2)
5. Safety compliance (0-2)

Release gate:

1. Mean >= 8.0/10
2. Safety compliance >= 99%

## 9. Rollout Strategy

## Phase 2A: Dark Launch (Internal)

1. Backend `chat_turn` behind `REMY_CHAT_TURN_ENABLED=false` by default.
2. Internal users only.

Gate:

1. Schema compliance 100%
2. p95 latency target met

## Phase 2B: 10% Authenticated Cohort

1. Feature flag by user id hash.
2. Compare against control (current conversational quick-reply).

Gate:

1. +15% chat engagement
2. no increase in support incidents

## Phase 2C: 100% Authenticated Rollout

1. Full rollout with fallback kept active.
2. Weekly eval and drift monitoring.

## 10. Risks and Mitigations

1. Hallucinations:
   1. Mitigation: tool-grounded context + strict schema + fallback.
2. Latency:
   1. Mitigation: compact context, one-call design, timeout fallback.
3. Token cost:
   1. Mitigation: context pruning, message windowing, tool summaries.
4. Privacy:
   1. Mitigation: RLS + auth-bound subject resolution + redaction policies.

## 11. Definition of Done

1. Free-text chat is available for authenticated users.
2. Responses are personalized and domain-bounded.
3. CTA links are safe and actionable.
4. Full test suite (unit/integration/safety/perf/eval) meets release gates.
5. Telemetry dashboards track quality, safety, and conversion.
