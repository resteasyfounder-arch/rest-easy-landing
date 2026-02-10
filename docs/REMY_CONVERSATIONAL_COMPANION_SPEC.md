# Remy Conversational Companion Spec (V3)

Date: 2026-02-10  
Status: Proposed

## 1. Problem Statement

Current Remy is functional but feels heavy and task-board-like:

1. Too much content shown at once (nudge + priorities + rationale + reassurance).
2. Interaction feels like a static recommendation panel, not a companion.
3. On mobile, panel density and vertical height make it hard to follow.

This reduces clarity and emotional trust, even when recommendations are accurate.

## 2. Product Direction

Remy should feel like:

1. A calm companion.
2. A conversational assistant.
3. A trusted guide that explains decisions in plain language.

Remy must remain:

1. Domain-bounded to Rest Easy.
2. Personalized for authenticated users (profile + assessment + report state).
3. Action-oriented (not open-ended general chat).

## 3. Goals / Non-goals

## 3.1 Goals

1. Reduce Remy UI footprint by at least 40% on dashboard and launcher.
2. Shift from multi-card feed to conversation-first interface.
3. Preserve and improve conversion to high-impact next actions.
4. Make authenticated Remy explicitly personal (name, context, recent progress, streaks).

## 3.2 Non-goals

1. No open-domain or internet Q&A.
2. No legal/medical/financial advice generation outside readiness guidance.
3. No replacement of core roadmap/report features; Remy orchestrates them.

## 4. Experience Principles

1. One thing at a time: one primary message, one primary action.
2. Conversational first: chat turns over stacked cards.
3. Optional depth: rationale and evidence are expandable, not always visible.
4. Human tone: supportive, concise, non-judgmental language.
5. Personal always: use known user context in every authenticated reply.

## 5. UX Redesign Spec

## 5.1 Shell and Size

1. Replace large panel content with a compact conversation sheet.
2. Launcher states:
   1. Collapsed bubble (avatar + subtle status dot).
   2. Peek chip (one-line nudge).
   3. Conversation sheet (mobile: bottom sheet; desktop: right dock panel).
3. Max initial height:
   1. Mobile: 55vh
   2. Desktop: 520px

## 5.2 Conversation Structure

Each turn can include:

1. Remy message (1-3 short sentences).
2. Up to 2 quick replies.
3. Optional single CTA button.
4. Optional "Why this" disclosure.

Do not render a full priorities list in chat by default. Use:

1. "Show top priorities" quick reply, then progressive reveal.

## 5.3 Home (Guest)

1. Keep animated Remy demo card in the landing section.
2. CTA opens Remy conversation sheet directly.
3. Guest Remy supports these intents:
   1. What Rest Easy does
   2. Findability assessment
   3. Why create an account
   4. How Remy helps after login

## 5.4 Authenticated Experience

Every first message on session open includes:

1. Personalized greeting (first name if available).
2. Current phase summary (profile/readiness/report).
3. One high-impact next step.

Remy memory (session-level) should remember:

1. Last user question in session.
2. Last recommended action.
3. Which details user asked to expand.

## 5.5 Dashboard Placement

Replace current large `RemyBriefCard` with:

1. Compact "Remy Snapshot" card (single sentence + open chat button).
2. Full conversational flow lives in launcher sheet.

## 6. Conversation Design (Behavior)

## 6.1 Intent Classes

1. Clarify: "What does this mean?"
2. Prioritize: "What should I do first?"
3. Explain score: "Why is this low/high?"
4. Plan next: "What should I do next week?"
5. Reassure: "Am I behind?"

## 6.2 Response Template

For authenticated turns:

1. Empathy line.
2. Context line using user state.
3. Recommendation line.
4. Optional action.

Example shape:

1. "You're making progress."
2. "Based on your Legal section answers and report freshness..."
3. "The highest-impact next step is updating your will details."
4. "Want me to take you there now?"

## 6.3 Guardrails

1. If out-of-domain query, Remy redirects to supported domains.
2. If confidence is low, Remy says what data is missing and asks one focused follow-up.
3. Never fabricate personal facts not present in profile/answers/report.

## 7. Personalization Contract (Login Enabled)

For authenticated users, payload generation must include:

1. Identity-derived subject resolution.
2. Profile intake summary features.
3. Section completion + weak spots.
4. Report status/staleness.
5. Recent edits or changed answers.

Add explicit `personalization_context` object in Remy payload:

1. `display_name`
2. `current_phase`
3. `progress_percent`
4. `top_focus_area`
5. `last_updated_at`

## 8. Technical Spec

## 8.1 Frontend Components

1. New:
   1. `RemyConversationSheet.tsx`
   2. `RemyMessageList.tsx`
   3. `RemyQuickReplies.tsx`
   4. `RemySnapshotCard.tsx`
2. Update:
   1. `RemyGlobalLauncher.tsx` to host sheet state machine.
   2. `RemyBriefCard.tsx` reduced to snapshot style.

## 8.2 Hook/API

Extend `useRemySurface` with conversational action:

1. `action: "chat_turn"`
2. Request:
   1. `surface`
   2. `message`
   3. `conversation_id`
   4. `context_hint` (optional)
3. Response:
   1. `assistant_message`
   2. `quick_replies[]`
   3. `cta`
   4. `why_this` (optional)
   5. `conversation_id`

## 8.3 Backend

In `supabase/functions/remy/index.ts` add:

1. `chat_turn` action with deterministic template engine first.
2. Intent classifier using bounded rules.
3. Source reference bundle for each response.

Optional Phase 2:

1. LLM copy refinement behind feature flag (`REMY_LLM_COPY=true`) while keeping deterministic recommendation selection.

## 9. Data and Observability

Add Remy conversation events:

1. `remy_chat_opened`
2. `remy_chat_turn`
3. `remy_quick_reply_clicked`
4. `remy_cta_clicked`
5. `remy_why_this_opened`

Core KPIs:

1. Chat engagement rate.
2. Action conversion from chat.
3. Time-to-next-action.
4. Dismiss rate reduction vs current launcher.
5. User sentiment proxy (thumbs up/down on response).

## 10. Rollout Plan

## Phase 0: UX Contract Freeze

1. Approve Remy voice/personality guidelines.
2. Approve compact conversation wireframes.
3. Approve payload contract for `chat_turn`.

Acceptance:

1. Product + engineering signoff on message anatomy and constraints.

## Phase 1: Compact UI Foundation

1. Introduce conversation sheet UI.
2. Replace bulky launcher content with one-turn + quick replies.
3. Keep existing recommendation logic for safety.

Acceptance:

1. Remy panel height and visual noise reduced.
2. No regression in CTA navigation.

## Phase 2: Personalized Conversational Turns (Auth)

1. Add `chat_turn` backend action.
2. Inject personalization context into every authenticated turn.
3. Add expandable rationale inside turns.

Acceptance:

1. Logged-in user sees personal context in first and follow-up turns.
2. Domain guardrails validated by tests.

## Phase 3: Dashboard Simplification

1. Replace `RemyBriefCard` with compact snapshot + open-chat CTA.
2. Move details into conversational flow only.

Acceptance:

1. Dashboard visual density reduced.
2. Task completion from Remy is stable or improved.

## Phase 4: Optimization

1. Tune quick replies by route and progression state.
2. A/B test tone and response length.
3. Optional LLM copy polish behind flag.

Acceptance:

1. Improved engagement and action conversion metrics.

## 11. Testing Strategy

1. Unit tests:
   1. intent classification
   2. domain guardrail handling
   3. personalization context assembly
2. Integration tests:
   1. auth user chat flow
   2. guest chat flow
   3. CTA deep-link safety
3. UX smoke tests:
   1. mobile sheet size and readability
   2. desktop dock behavior
   3. first-open response time target under 600ms (p95)

## 12. Immediate Next Step (Recommended)

Implement Phase 1 in a focused PR:

1. Add compact conversation sheet UI.
2. Rework launcher to one-turn conversational layout.
3. Keep existing deterministic recommendation backend.
4. Add event tracking for open/turn/cta.
