
Goal
- Navigating to “Life Readiness” (/readiness) after an assessment is already complete must NOT trigger report generation.
- A new report should only be generated:
  1) The first time the assessment becomes complete, or
  2) After a user updates a question/profile answer (and only because of that update, not because they visited a page).

What’s happening (root cause)
- The /readiness page contains legacy client-side report generation code:
  - It watches `flowPhase === "complete"` and then automatically calls the `generate-report` edge function from the browser.
  - When you navigate to /readiness after completion, the backend hydration sets `flow_phase` to `"complete"` (because the assessment is completed), which satisfies that condition, so the client fires report generation again.
- This is confirmed by the browser network log showing:
  - `POST .../functions/v1/generate-report` coming from the web app origin when you merely navigated to /readiness.

Design decision (to match your requirement)
- /readiness should never “hijack” the experience with a “Preparing Your Report” screen just because a report is generating.
- /readiness should be for taking/reviewing the assessment (and section summaries).
- /results should be the place that shows “Preparing Your Report” while the report is generating.

Implementation approach
A) Move “first-time completion” report triggering fully to the backend (agent edge function)
Why:
- Guarantees report generation happens only as a consequence of the completion/write event (answer/profile update), never because a UI route mounted.
- Removes the current behavior where the browser can regenerate reports just by visiting /readiness.

Changes in `supabase/functions/agent/index.ts`
1) After saving answers/profile (in the default upsert flow), determine whether the assessment is now complete.
2) If the assessment is complete AND no report exists yet:
   - Synchronously update `assessments.report_status = "generating"` (and `report_stale = false` for first-time generation).
   - Kick off `triggerReportRegeneration(...)` via `EdgeRuntime.waitUntil(...)`.
3) Ensure idempotency so we do NOT re-trigger if:
   - `report_status` is already `"generating"`, or
   - `report_data` exists / `report_status` is `"ready"`.

Acceptance criteria for backend
- Completing the last applicable question results in:
  - `report_status` switching to `"generating"` immediately in the same request,
  - then later `"ready"` once the background report finishes.
- Merely calling `get_state` / navigating pages never flips `report_status` or starts generation.

B) Remove client-side report generation from /readiness entirely
Why:
- It is the direct cause of “Preparing Your Report” appearing on navigation and repeated report generation.
- It currently calls `generate-report` from the browser, which is exactly what we want to avoid for both correctness and control.

Changes in `src/pages/Readiness.tsx`
1) Delete the client report generation machinery:
   - Remove `reportGenerating`, `reportError`, `hasTriggeredAutoReport` state.
   - Remove the “Auto-trigger report generation when assessment is complete” `useEffect`.
   - Remove `handleGenerateReport()` and `handleRetryReport()` and any UI branches that depend on them.
2) Adjust completion behavior so completed assessments open as “review” in /readiness:
   - When the backend hydrates `flow_phase: "complete"` (because assessment status is completed), the page should transition into `flowPhase = "review"` for navigation use-cases.
   - This ensures the user can always review sections and see section summaries, instead of being blocked by report-related UI.
3) Keep section summaries as the “moment” after finishing a section:
   - The final section summary already supports “View Full Report” when `isAssessmentComplete` is true.
   - That becomes the primary path to /results after completion.
4) Ensure no browser request ever calls:
   - `/functions/v1/generate-report` from Readiness.

Acceptance criteria for /readiness
- If the report is already generated and the assessment is complete:
  - Navigating to /readiness shows the review/assessment UI (journey + sections + section summaries), not “Preparing Your Report.”
  - No new report generation is started.
- If a report is generating due to an answer/profile update:
  - /readiness still remains usable for review (no forced “Preparing Your Report” takeover).
  - /results continues to be the place that shows generation progress.

C) Update dashboard CTA so “Preparing Report…” routes to /results (not /readiness)
Why:
- After we remove report generation from /readiness, “Preparing Report…” should send users to the report page, which already knows how to poll and display progress.

Changes in `src/components/dashboard/AssessmentCTA.tsx`
- For “Assessment complete but no report yet”:
  - Change the link target from `/readiness` to `/results`.
- Optionally, for “report_status === generating”:
  - Either keep disabled, or link to `/results` so users can watch progress (preferred for transparency while keeping the UI calm).

Testing plan (end-to-end)
1) Fresh private window
   - Start assessment → complete all questions → confirm:
     - Agent marks report as generating (server-side) on completion.
     - /readiness shows final section summary and offers “View Full Report”.
     - /results shows the generating UI and then the report when ready.
2) After report is ready
   - Navigate Dashboard → Life Readiness (/readiness):
     - Verify no “Preparing Your Report” screen appears.
     - Verify in Network tab: no POST to `/functions/v1/generate-report`.
3) Update a single answer (e.g., from roadmap or section edit)
   - Confirm report status transitions to generating due to the update.
   - Confirm /readiness does not trigger generation; only the update did.
   - Confirm /results shows generating UI and eventually the updated report.

Files to change
- Backend:
  - `supabase/functions/agent/index.ts`
- Frontend:
  - `src/pages/Readiness.tsx`
  - `src/components/dashboard/AssessmentCTA.tsx`

Risks / edge cases to handle
- Race timing: ensure the completion-request response sets `report_status = "generating"` before returning so the UI doesn’t sit in a confusing “no report” state.
- Don’t regress deep-link behavior (`?section=` / `?question=`): keep the existing `hasPendingNavigation` guard behavior intact.
- Ensure no loop where completed assessments keep flipping phases; completion should settle into review when visiting /readiness from nav.