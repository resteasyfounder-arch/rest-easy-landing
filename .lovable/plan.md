
# Strict Report Generation Rules: Background Regeneration on Answer Update

## Current State Analysis

### How Report Synchronization Works Today:
1. **Answer Updates Set `report_stale: true`** (Lines 1027-1042 in `agent/index.ts`)
   - When answers are saved, the agent checks if `report_status === "ready"`
   - If so, it marks `report_stale: true` and updates `last_answer_at`

2. **Report Generation Trigger** (Lines 1125-1134 in `Readiness.tsx`)
   - Report auto-generates ONLY when `flowPhase === "complete"`
   - The `hasTriggeredAutoReport` flag prevents double-triggering
   - Generation happens synchronously before navigating to Results

3. **Results Page Handling** (Lines 38-106 in `Results.tsx`)
   - Checks `report_status` via `get_state` action
   - If `generating`, shows loading UI and polls for completion
   - If `ready`, fetches and displays the report

### Current Gap:
When a user updates an answer from the Dashboard roadmap:
- Answer is saved → `report_stale` is set to `true`
- User returns to Dashboard → Dashboard shows updated scores
- User navigates to Results → **Stale report is displayed** (no regeneration triggered)

---

## Proposed Solution: Strict, Explicit Regeneration Rules

### Rule Set (No Automatic/Fuzzy Logic):

| Trigger Event | Action |
|--------------|--------|
| **Assessment completes for the first time** | Generate report (existing behavior) |
| **Any answer is updated** | Trigger background regeneration immediately |
| **Profile is updated** | Trigger background regeneration immediately |
| **User visits Results page while `report_status === "generating"`** | Show ReportLoading screen, poll until ready |
| **User visits Results page while `report_stale === true`** | Show ReportLoading screen, trigger regeneration |

### Implementation: Two-Part Approach

#### Part 1: Background Regeneration After Answer Update

Modify the agent to trigger report regeneration as a **background task** whenever an answer is saved and a report already exists.

```text
Answer Saved → Agent marks report_stale
            → Agent sets report_status = "generating"
            → Agent triggers generate-report via EdgeRuntime.waitUntil()
            → User continues immediately (non-blocking)
```

#### Part 2: Results Page Handles All Stale/Generating States

The Results page already handles `report_status === "generating"`. Add handling for `report_stale === true`:

```text
User visits /results
  → Fetch assessment state
  → If report_status === "generating" OR report_stale === true:
      → Show ReportLoading
      → Poll until report_status === "ready" AND report_stale === false
  → Else:
      → Display report
```

---

## Technical Implementation

### File: `supabase/functions/agent/index.ts`

#### Change 1: Add Background Report Generation Helper

```typescript
async function triggerReportRegeneration(
  readiness: ReturnType<...>,
  assessmentDbId: string,
  subjectId: string,
  assessmentKey: string
) {
  console.log(`[agent] Triggering background report regeneration for ${assessmentDbId}`);
  
  // Set status to generating BEFORE starting background task
  await readiness
    .from("assessments")
    .update({
      report_status: "generating",
      report_stale: true,
    })
    .eq("id", assessmentDbId);
    
  // Build report payload from current state
  const assessmentState = await computeAssessmentState(
    readiness, subjectId, assessmentDbId, assessmentKey
  );
  
  // Load schema for section labels/weights
  const { data: schemaData } = await readiness
    .from("assessment_schemas")
    .select("schema_json")
    .eq("assessment_id", assessmentKey)
    .eq("version", "v1")
    .single();
  
  const schema = schemaData?.schema_json;
  
  // Build section scores with labels
  const sectionScores: Record<string, { score: number; label: string; weight: number }> = {};
  for (const section of assessmentState.sections) {
    sectionScores[section.id] = {
      score: section.score,
      label: section.label,
      weight: schema?.sections?.find(s => s.id === section.id)?.weight || 1,
    };
  }
  
  // Build answers array
  const answersForReport = Object.values(assessmentState.answers).map(answer => ({
    question_id: answer.question_id,
    section_id: answer.section_id,
    question_text: answer.question_text || "",
    answer_value: answer.answer_value,
    answer_label: answer.answer_label || answer.answer_value,
    score_fraction: answer.score_fraction ?? null,
  }));
  
  // Call generate-report
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  
  const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-report`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`,
    },
    body: JSON.stringify({
      userName: "Friend",
      profile: assessmentState.profile_data,
      overallScore: assessmentState.overall_score,
      tier: assessmentState.tier,
      sectionScores,
      answers: answersForReport,
      schema: {
        answer_scoring: schema?.answer_scoring || {},
        score_bands: schema?.score_bands || [],
        sections: schema?.sections || [],
      },
    }),
  });
  
  const data = await response.json();
  
  if (response.ok && data.report) {
    // Save report and clear stale flag
    await readiness
      .from("assessments")
      .update({
        report_status: "ready",
        report_data: data.report,
        report_generated_at: new Date().toISOString(),
        report_stale: false,
      })
      .eq("id", assessmentDbId);
    console.log(`[agent] Background report regeneration complete`);
  } else {
    // Mark as failed
    await readiness
      .from("assessments")
      .update({
        report_status: "failed",
      })
      .eq("id", assessmentDbId);
    console.error(`[agent] Background report regeneration failed:`, data.error);
  }
}
```

#### Change 2: Modify Answer Save Logic to Trigger Background Regeneration

Replace the current stale-marking logic (lines 1027-1050) with:

```typescript
if (payload.answers && payload.answers.length > 0) {
  // ... existing answer save logic ...
  
  // Check if report exists and needs regeneration
  const { data: currentAssessment } = await readiness
    .from("assessments")
    .select("report_status, report_data")
    .eq("id", assessmentResult.id)
    .maybeSingle();

  // Only trigger regeneration if a report has been generated before
  if (currentAssessment?.report_data && currentAssessment?.report_status === "ready") {
    console.log(`[agent] Answer updated, triggering background report regeneration`);
    
    // Use EdgeRuntime.waitUntil for background execution
    EdgeRuntime.waitUntil(
      triggerReportRegeneration(
        readiness,
        assessmentResult.id,
        subjectResult.id,
        assessmentKey
      )
    );
  } else {
    // Just update last_answer_at if no report exists yet
    await readiness
      .from("assessments")
      .update({
        last_answer_at: new Date().toISOString(),
      })
      .eq("id", assessmentResult.id);
  }
}
```

#### Change 3: Same Logic for Profile Updates

When profile is saved (around line 986-1000), add similar logic to trigger regeneration if report exists.

---

### File: `src/pages/Results.tsx`

#### Change: Handle `report_stale` Same as `generating`

Update the fetchReport logic (lines 48-75):

```typescript
const stateData = await stateResponse.json();
const reportStatus = stateData?.assessment_state?.report_status;
const reportStale = stateData?.assessment_state?.report_stale;

// If generating OR stale, show loading and poll
if (reportStatus === "generating" || (reportStatus === "ready" && reportStale)) {
  console.log("[Results] Report is generating or stale, showing progress UI");
  setIsGenerating(true);
  setLoading(false);
  pollForReport(subjectId);
  return;
}
```

#### Change: Update Polling to Check Stale Flag

```typescript
const pollForReport = async (subjectId: string) => {
  const poll = async () => {
    // Fetch BOTH report and state to check stale flag
    const [reportResponse, stateResponse] = await Promise.all([
      fetch(`${SUPABASE_URL}/functions/v1/agent`, {
        method: "POST",
        headers: { ... },
        body: JSON.stringify({
          action: "get_report",
          subject_id: subjectId,
          assessment_id: "readiness_v1",
        }),
      }),
      fetch(`${SUPABASE_URL}/functions/v1/agent`, {
        method: "POST",
        headers: { ... },
        body: JSON.stringify({
          action: "get_state",
          subject_id: subjectId,
          assessment_id: "readiness_v1",
        }),
      }),
    ]);
    
    const reportData = await reportResponse.json();
    const stateData = await stateResponse.json();
    
    const reportStale = stateData?.assessment_state?.report_stale;
    
    // Only show report if it exists AND is not stale
    if (reportResponse.ok && reportData.report && !reportStale) {
      setReport(reportData.report);
      setIsGenerating(false);
      return;
    }
    
    // Continue polling
    if (attempts < maxAttempts) {
      setTimeout(poll, 2000);
    }
  };
  
  poll();
};
```

---

### File: `src/pages/Readiness.tsx`

#### Change: Remove Manual Generation from Complete Phase (Optional Cleanup)

Since regeneration now happens in the background on every answer update, the complete phase no longer needs to trigger generation. However, we should KEEP the first-time generation logic for new assessments that have never had a report.

The current auto-trigger logic (lines 1125-1134) can remain as a fallback for first-time report generation.

---

## Strict Rule Summary

| Rule | Implementation |
|------|---------------|
| Report generates on first completion | Existing logic in Readiness.tsx complete phase |
| Report regenerates on answer update | Agent triggers `EdgeRuntime.waitUntil()` background task |
| Report regenerates on profile update | Agent triggers `EdgeRuntime.waitUntil()` background task |
| Results shows loading if generating | Check `report_status === "generating"` |
| Results shows loading if stale | Check `report_stale === true` |
| No manual regenerate button | Already removed per previous requirements |

---

## Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/agent/index.ts` | Add `triggerReportRegeneration()` helper, modify answer/profile save to call it via `EdgeRuntime.waitUntil()` |
| `src/pages/Results.tsx` | Handle `report_stale === true` same as `generating`, update polling to check stale flag |

---

## Edge Cases Handled

1. **User updates answer → immediately goes to Results**
   - `report_status` is already `"generating"` (set synchronously before background task starts)
   - Results page shows loading screen
   - Polling picks up the new report when ready

2. **User updates multiple answers quickly**
   - Each update triggers a new background regeneration
   - Latest regeneration will "win" (overwrites previous)
   - `report_stale` stays `true` until final regeneration completes

3. **Report generation fails**
   - `report_status` is set to `"failed"`
   - Results page can show error state (already handled)
   - User can retry from Results page

4. **New user completing assessment for first time**
   - No `report_data` exists yet
   - Readiness.tsx complete phase triggers first generation
   - No background regeneration happens (no existing report to regenerate)
