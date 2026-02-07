# Remy Integration Spec (Feature, Not Chatbot)

Date: 2026-02-07  
Status: Draft for product/engineering approval

## 1. Current Product Intent (From Code Review)

Rest Easy is a guided readiness product that moves people from uncertainty to action:

1. Capture profile context and assessment answers.
2. Compute section/overall readiness state server-side.
3. Generate a personalized report and roadmap.
4. Let users improve answers and track progress over time.

The core app already has the right data foundation:

- Profile context (`profile_intake.profile_json`)
- Assessment state and section progress (`assessments`, computed in `agent`)
- Full answer history (`assessment_answers`)
- Report output (`assessments.report_data`, status/staleness fields)
- Improvement opportunities and priorities (`get_improvement_items`)

## 2. Current Remy Gap

Remy currently exists as landing-page messaging only:

- Marketing section and animated demo on home page
- Disabled CTA ("Coming soon")
- No in-product Remy feature surfaces
- No Remy-specific API/domain contract

## 3. Remy Product Definition

Remy is a product feature that:

1. Only operates within the Rest Easy readiness domain.
2. Uses user profile data, assessment state, and report data.
3. Delivers four outcomes:
   - Nudge: what to do now
   - Explain: why this matters / why score changed
   - Prioritize: what is most impactful first
   - Reassure: progress framing without alarm

Non-goals:

1. No free-form chatbot interface.
2. No open-domain Q&A.
3. No legal/medical advice generation beyond readiness guidance.

## 4. User-Facing Feature Spec

## 4.1 Dashboard: Remy Brief Card (MVP Surface)

Trigger:

- User opens dashboard or assessment/report state changes.

Inputs:

- `assessment_state` + `report_preview` + `get_improvement_items`.

Output:

- One "Remy Brief" card with:
  - Primary nudge (single recommended next action)
  - Why-now explanation (1-2 lines)
  - Priority list (top 3 actions)
  - Reassurance line tied to progress

Actions:

- `Do this now` (deep-link to `/readiness?...` or `/results#action-plan`)
- `Why this?` (expands explanation)
- `Not now` (dismiss for session/day)

## 4.2 Readiness Flow: Contextual Remy Nudges

Trigger:

- Section enter, section complete, answer update, or profile unlock event.

Inputs:

- Current section status + question context + profile applicability.

Output:

- Inline nudge banner above question card:
  - Focus statement
  - Impact statement
  - Optional reassurance message

Rules:

- Max 1 nudge visible at a time.
- No interruption modal while answering.

## 4.3 Section Summary: Remy Insight (Replace Generic "AI Insight")

Trigger:

- Section completion screen.

Inputs:

- Section answers + section score + report/overall context.

Output:

- Rename and standardize "AI Insight" to "Remy Insight".
- Keep concise (2-3 sentences), domain-specific, and action-oriented.

## 4.4 Results: Remy Priority + Reassurance Layer

Trigger:

- Report available or regenerated.

Inputs:

- `report.action_plan`, `immediate_actions`, weak sections, staleness.

Output:

- "Remy Priorities" block:
  - Top 3 actions with rationale
  - Expected effort/timeline
  - Confidence/reassurance copy

## 5. Domain Guardrails Spec

Every Remy response must satisfy:

1. Uses only readiness domain data (profile/answers/sections/report/improvement items).
2. References source fields used to derive each recommendation.
3. No external-topic advice.
4. No persona drift into chat mode.
5. Tone: calm, clear, non-judgmental, specific.

## 6. Technical Architecture Spec

## 6.1 API Contract

Add a dedicated edge function:

- `supabase/functions/remy/index.ts`

Actions:

1. `get_surface_payload`
2. `dismiss_nudge`
3. `ack_action`

Request shape:

```json
{
  "action": "get_surface_payload",
  "subject_id": "uuid",
  "assessment_id": "readiness_v1",
  "surface": "dashboard|readiness|section_summary|results",
  "section_id": "optional"
}
```

Response shape:

```json
{
  "surface": "dashboard",
  "generated_at": "ISO-8601",
  "domain_scope": "rest_easy_readiness",
  "nudge": { "id": "string", "title": "string", "body": "string", "cta": { "label": "string", "href": "string" } },
  "explanations": [{ "id": "string", "title": "string", "body": "string", "source_refs": ["section:1", "report:action_plan[0]"] }],
  "priorities": [{ "id": "string", "title": "string", "priority": "HIGH|MEDIUM|LOW", "why_now": "string", "target_href": "string" }],
  "reassurance": { "title": "string", "body": "string" }
}
```

## 6.2 Data Strategy

Reuse existing readiness tables first:

1. `assessment_answers`, `profile_intake`, `assessments.report_data`
2. `readiness_actions` for persistent prioritized tasks
3. `events` for Remy telemetry/audit

Add one lightweight state table:

- `readiness_v1.remy_preferences`
  - `subject_id` (pk)
  - `dismissed_nudges jsonb`
  - `updated_at`

## 6.3 Decision Engine (Deterministic First)

Phase 1 scoring (no LLM required):

1. Candidate actions from `get_improvement_items`.
2. Priority score:
   - `priority_weight(section_weight, score_fraction, report_stale, last_answer_at)`
3. Explanation templates map to explicit signals.
4. Reassurance templates map to progress deltas and completed sections.

LLM can be optional for copy refinement later, not for ranking correctness.

## 7. Frontend Integration Spec

Add:

1. `src/types/remy.ts`
2. `src/hooks/useRemySurface.ts`
3. `src/components/remy/RemyBriefCard.tsx`
4. `src/components/remy/RemyInlineNudge.tsx`
5. `src/components/remy/RemyPriorityList.tsx`

Integrate:

1. Dashboard: inject `RemyBriefCard` above score/roadmap area.
2. Readiness: inject `RemyInlineNudge` above question card and section summary.
3. Results: inject `RemyPriorityList` near immediate actions/action plan.
4. Navigation: no standalone chat route; Remy appears as embedded feature blocks only.

## 8. Phased Implementation Plan

## Phase 0: Spec + Contract Freeze

Deliverables:

1. Approved product spec (this doc).
2. JSON schema for Remy API payload.
3. UX copy rules and guardrails.

Acceptance:

1. Product + engineering sign-off on exact payload fields and surfaces.

## Phase 1: Backend Foundation

Deliverables:

1. `remy` edge function with `get_surface_payload`.
2. Deterministic ranking/explanation/reassurance engine.
3. `remy_preferences` migration + basic dismiss handling.

Acceptance:

1. Returns valid payload for all surfaces with seeded data.
2. No external-domain language in outputs.

## Phase 2: Dashboard MVP

Deliverables:

1. `useRemySurface("dashboard")`.
2. `RemyBriefCard` on dashboard.
3. CTA deep links to readiness/results.

Acceptance:

1. User sees one coherent next-step recommendation.
2. "Not now" suppresses repeated nudge per preference policy.

## Phase 3: In-Flow Readiness + Section Summary

Deliverables:

1. Inline nudges in readiness question flow.
2. Replace generic section AI label with Remy framing.

Acceptance:

1. Nudges appear without blocking question flow.
2. Section completion always includes Remy-specific insight or graceful fallback.

## Phase 4: Results Integration

Deliverables:

1. Remy priority block in results.
2. Reassurance copy tied to report freshness and progress.

Acceptance:

1. Priorities align with roadmap ordering and section weights.
2. Stale report state is clearly explained.

## Phase 5: Observability + Hardening

Deliverables:

1. Event instrumentation (`events` table) for impression/click/dismiss.
2. QA suite for ranking determinism and UI rendering.

Acceptance:

1. Stable payloads under empty/new-user/partial/completed states.
2. No regressions in existing assessment/report flows.

## 9. QA and Test Spec

## 9.1 Unit Tests

1. Priority ranking function
2. Explanation template selection
3. Reassurance selection rules

## 9.2 Integration Tests

1. `remy.get_surface_payload` for:
   - New user
   - In-progress
   - Completed with ready report
   - Completed with stale report

## 9.3 E2E Tests

1. Dashboard card renders and deep-links.
2. Readiness inline nudge updates after answer save.
3. Results priority list reflects updated report state.

## 10. Implementation Progress (2026-02-07)

Completed:

1. Phase 1 backend foundation (`remy` edge function + deterministic payload engine + `remy_preferences` state table).
2. Phase 2 dashboard MVP (`RemyBriefCard` + dashboard integration + dismiss/ack wiring).
3. Phase 3 readiness integration (inline nudges + section summary relabel to "Remy Insight").
4. Phase 4 results integration (`RemyPriorityList` + reassurance/priority rendering).
5. Phase 5 observability hardening (runtime payload schema validation + telemetry events for impression/dismiss/ack + Remy observability views).
6. Integration smoke tests for new-user/in-progress/ready/stale payload states.

Remaining:

1. No remaining implementation items in this spec plan.

## 11. Success Metrics

Primary:

1. Increase in assessment completion rate.
2. Increase in first 7-day action completion.
3. Decrease in report-stale dwell time (time until refresh-triggering action complete).

Secondary:

1. Remy CTA click-through by surface.
2. Dismiss rate by nudge type.
3. Return rate to readiness after results view.

## 12. Open Decisions

1. Should Remy copy be deterministic-only initially, or template + LLM paraphrase?
2. Dismissal TTL defaults (session/day/week) by surface.
3. Whether to expose a "Remy" nav label (feature discovery) without creating a chat page.
