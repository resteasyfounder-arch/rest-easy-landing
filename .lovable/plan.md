
# Seamless Auto-Generate & Auto-Update Report System

## Summary

This plan removes all manual "Generate Report" / "Regenerate Report" buttons and implements a fully automated report lifecycle:

1. **First completion** - Report auto-generates when user finishes all applicable questions
2. **Any data change** - Report auto-updates when user edits an existing answer OR when profile changes introduce new questions that get answered

The user will never see a button to manually trigger report generation.

---

## Current State

| Action | Current Behavior |
|--------|-----------------|
| Complete assessment for first time | Shows "Generate Your Report" button - user must click |
| Edit existing answer | Answer saved, but report NOT updated |
| Profile change adds new questions | User must answer them, then manually regenerate |
| Dashboard when complete without report | Shows "Generate Report" button |

---

## Proposed Behavior

| Scenario | New Behavior |
|----------|--------------|
| Complete assessment for first time | Auto-generate report immediately, show loading state, redirect to results |
| Edit existing answer after report exists | Mark report as stale, auto-regenerate on next completion or navigation |
| Profile change adds new questions | Mark report as stale, user completes new Qs, auto-regenerate |
| Dashboard when complete without report | Show "Preparing Report..." loading state (generation happens automatically) |
| Dashboard when report is stale | Show "Update Available" badge, auto-update triggers when user visits readiness |

---

## Implementation Plan

### Phase 1: Database Schema Update

Add tracking fields to detect when report needs regeneration:

```sql
ALTER TABLE readiness_v1.assessments 
ADD COLUMN report_stale BOOLEAN DEFAULT false,
ADD COLUMN last_answer_at TIMESTAMPTZ;
```

- `report_stale`: Set to `true` when any answer/profile changes after report generation
- `last_answer_at`: Timestamp of most recent answer change (compared against `report_generated_at`)

---

### Phase 2: Agent Edge Function Updates

**Track answer changes:**
When saving answers, if `report_status = "ready"`, set `report_stale = true` and update `last_answer_at`:

```typescript
// In default upsert flow, after saving answers
if (payload.answers && payload.answers.length > 0) {
  // ... existing answer save logic ...
  
  // Check if report exists and mark as stale
  const { data: currentAssessment } = await readiness
    .from("assessments")
    .select("report_status, report_generated_at")
    .eq("id", assessmentResult.id)
    .single();
  
  if (currentAssessment?.report_status === "ready") {
    await readiness
      .from("assessments")
      .update({ 
        report_stale: true,
        last_answer_at: new Date().toISOString() 
      })
      .eq("id", assessmentResult.id);
  }
}
```

**Track profile changes:**
Similar logic when profile is saved - mark report stale if it exists.

**Return stale flag in get_state:**
Include `report_stale` in the AssessmentState response so the frontend knows when updates are pending.

**Reset stale flag on save_report:**
When a new report is saved, set `report_stale = false`.

---

### Phase 3: Update Readiness.tsx - Auto-Generate on Completion

**Remove the manual "Generate Your Report" button:**

Replace the completion screen with auto-triggering logic:

```typescript
// Auto-generate report when reaching complete phase
useEffect(() => {
  if (flowPhase === "complete" && !reportGenerating) {
    // Check if we need to generate/regenerate
    const needsReport = !assessmentState?.report_status || 
                        assessmentState.report_status === "not_started" ||
                        assessmentState.report_stale;
    
    if (needsReport) {
      handleGenerateReport();
    }
  }
}, [flowPhase, reportGenerating, assessmentState]);
```

**Update completion screen UI:**

Instead of showing buttons, show:
- Loading spinner with "Preparing your personalized report..."
- Progress indication
- Auto-redirect when complete

If report already exists and is NOT stale, redirect immediately to results.

---

### Phase 4: Update Readiness.tsx - Handle Stale Report on Answer Edit

When an answer is saved via `handleSaveEditedAnswers` or the main `handleSelect`:

1. Remove the localStorage-based stale tracking
2. The backend will handle marking `report_stale = true`
3. When user finishes editing and assessment is still complete, auto-regenerate

```typescript
// In handleSaveEditedAnswers, after saving:
// If assessment is complete and we just edited an answer, 
// the backend marks it stale. Frontend can show a toast.
toast.info("Your report will be updated with these changes.");
```

---

### Phase 5: Update AssessmentCTA.tsx - Remove Manual Buttons

**Remove "Generate Report" button entirely:**

```typescript
// BEFORE: When complete but no report
return (
  <Button>Generate Report</Button>  // REMOVE
);

// AFTER: When complete but no report or report generating
return (
  <Button disabled className="gap-2">
    <Loader2 className="h-4 w-4 animate-spin" />
    Preparing Report...
  </Button>
);
```

**Add stale report indicator:**

```typescript
// When report exists but is stale
if (report_status === "ready" && report_stale) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <Button asChild size="lg">
        <Link to="/results" className="gap-2">
          <FileText className="h-4 w-4" />
          View Report
          <Badge variant="secondary" className="ml-1">Update Available</Badge>
        </Link>
      </Button>
    </div>
  );
}
```

---

### Phase 6: Update Types

Add `report_stale` to AssessmentState:

```typescript
// src/types/assessment.ts
export interface AssessmentState {
  // ... existing fields ...
  report_stale: boolean;
}
```

---

## Data Flow Diagram

```text
USER EDITS ANSWER                     USER COMPLETES ASSESSMENT
       │                                        │
       ▼                                        ▼
┌──────────────────┐               ┌──────────────────────┐
│ Save to backend  │               │ flowPhase = complete │
└──────────────────┘               └──────────────────────┘
       │                                        │
       ▼                                        ▼
┌──────────────────┐               ┌──────────────────────┐
│ Backend: Check   │               │ Check: Need report?  │
│ if report exists │               │ (!ready || stale)    │
└──────────────────┘               └──────────────────────┘
       │                                        │
       ▼ (if yes)                               ▼ (if yes)
┌──────────────────┐               ┌──────────────────────┐
│ Set report_stale │               │ Auto-call            │
│ = true           │               │ handleGenerateReport │
└──────────────────┘               └──────────────────────┘
                                                │
                                                ▼
                                   ┌──────────────────────┐
                                   │ Show loading UI      │
                                   │ "Preparing Report"   │
                                   └──────────────────────┘
                                                │
                                                ▼
                                   ┌──────────────────────┐
                                   │ Generate via GPT-4o  │
                                   │ Save to database     │
                                   │ report_stale = false │
                                   └──────────────────────┘
                                                │
                                                ▼
                                   ┌──────────────────────┐
                                   │ Auto-redirect to     │
                                   │ /results             │
                                   └──────────────────────┘
```

---

## User Experience

### First-Time Completion
1. User answers final question
2. Screen instantly shows: "Preparing your personalized report..." with elegant loading animation
3. 5-15 seconds later, auto-redirects to full report page
4. No buttons to click - completely seamless

### Editing an Answer After Report Exists
1. User navigates to section via Dashboard or Readiness
2. Edits an answer and saves
3. Toast appears: "Changes saved. Your report will reflect these updates."
4. If still on complete phase, report auto-regenerates in background
5. Dashboard shows "View Report (Update Available)" badge until regeneration completes

### Profile Change Adds New Questions
1. User edits profile, changing a gating answer
2. Dashboard CTA changes to "Continue Assessment" (new questions available)
3. User answers new questions
4. Upon completion, report auto-generates with all new data
5. Seamless redirect to results

---

## Files to Modify

| File | Changes |
|------|---------|
| Database migration | Add `report_stale`, `last_answer_at` columns |
| `supabase/functions/agent/index.ts` | Track stale state on answer/profile save, return in get_state, reset on save_report |
| `src/types/assessment.ts` | Add `report_stale: boolean` to AssessmentState |
| `src/pages/Readiness.tsx` | Auto-trigger report generation, remove manual button, update completion UI |
| `src/components/dashboard/AssessmentCTA.tsx` | Remove "Generate Report", add loading/stale states |
| `src/hooks/useAssessmentState.ts` | Expose `isReportStale` computed property |

---

## Edge Cases Handled

| Scenario | Behavior |
|----------|----------|
| Report generation fails | Show error toast with "Retry" option (only manual trigger allowed) |
| User navigates away during generation | Generation continues, redirect happens when they return |
| Multiple quick edits | Only one regeneration triggered after edits settle |
| Offline/network error | Show sync error indicator, retry on reconnect |

---

## Summary

This approach ensures:
- Users never see "Generate Report" or "Regenerate" buttons
- Reports are always up-to-date with latest answers
- First completion is seamless with loading state and auto-redirect
- Answer edits automatically trigger report updates
- Dashboard accurately reflects report freshness
