
# Fix: Always Show Section Summary After Completing a Section

## Problem Identified

The section summary page only appears when completing a section that was explicitly navigated to via the sidebar or dashboard (i.e., when `focusedSectionId` is set). During a natural linear flow through the assessment, the code skips directly to the next section's first question without showing any completion celebration or summary.

## Root Cause

In the `handleAnswer` function (around line 863), when a section is completed but no `focusedSectionId` is set, the code finds the next global step and navigates there immediately:

```
if (nextInSection) {
  // Stay in the same section
  setCurrentStepId(`question:${nextInSection.id}`);
} else if (focusedSectionId) {
  // ✅ Focused section complete - shows SectionComplete view
  setViewingCompletedSection(true);
} else {
  // ❌ No focus - SKIPS summary and jumps to next section
  const nextStep = getNextStepId(...);
  setCurrentStepId(nextStep);
}
```

## Solution

Modify the section completion logic to **always** show the section summary when the last question of a section is answered, regardless of whether `focusedSectionId` was set.

## Technical Changes

### File: `src/pages/Readiness.tsx`

**Change 1: Detect section completion in the "non-focused" branch**

After line 863, instead of immediately jumping to the next step, detect if we just completed the current section and show the summary:

```typescript
} else {
  // Not focused on a section - check if we just completed the current section
  const justCompletedSectionId = currentQuestion.section_id;
  const justCompletedSectionQuestions = nextApplicable.filter(
    q => q.section_id === justCompletedSectionId
  );
  const sectionNowComplete = justCompletedSectionQuestions.every(
    q => nextAnswers[q.id]
  );
  
  if (sectionNowComplete) {
    // Show section summary before moving on
    setStepHistory((prev) => [...prev, currentStepId]);
    setFocusedSectionId(justCompletedSectionId);
    setFlowPhase("section-summary");
  } else {
    // Find next global step (existing logic)
    setStepHistory((prev) => [...prev, currentStepId]);
    const nextStep = getNextStepId(nextProfileAnswers, nextAnswers, nextProfile);
    
    if (nextStep) {
      setCurrentStepId(nextStep);
    } else {
      setFlowPhase("complete");
      setCurrentStepId(null);
    }
  }
}
```

**Change 2: Update `handleContinueFromCompletedSection` to work with section-summary**

The current `handleContinueFromCompletedSection` handler resets `viewingCompletedSection` and finds the next step. We need the "Continue" button in `SectionSummary` to do similar navigation:

The `SectionSummary` component's `onContinue` callback should:
1. Clear `focusedSectionId`
2. Find the next unanswered question in the next section
3. Navigate there OR go to "complete" phase if all done

This already works via the existing `handleContinueFromCompletedSection` function which is passed as `onContinue` to `SectionSummary`.

**Change 3: Ensure proper flow from SectionSummary**

The section summary phase (line 1449) already handles the "Continue Assessment" button via `onContinue={handleContinueFromCompletedSection}`. We just need to make sure this function correctly finds the next section's first question.

Review `handleContinueFromCompletedSection` (lines 926-941):
- It clears `viewingCompletedSection` and `focusedSectionId`
- Finds the next step using `getNextStepId`
- Sets flow to "assessment" or "complete"

This logic is correct but may need a small tweak to ensure `currentStepId` is set properly for the next section.

---

## Summary of Changes

| Location | Change |
|----------|--------|
| `handleAnswer()` (lines 863-874) | Add section completion detection in the "non-focused" branch. Set `focusedSectionId` and `flowPhase = "section-summary"` when section is complete. |
| `handleContinueFromCompletedSection()` | Verify it properly sets `currentStepId` for the next section's first question |

## Expected Behavior After Fix

1. User answers the last question of a section (e.g., Legal Planning)
2. **Section Summary page appears** with:
   - Section score
   - AI-generated insight
   - "Review & Edit Answers" button
   - "Continue Assessment" button
3. User clicks "Continue Assessment"
4. Flow navigates to the first question of the next section (e.g., Healthcare)
5. Repeat for each section until assessment is complete

---

## Technical Notes

- The `SectionSummary` component is already built and displays properly when `flowPhase === "section-summary"` (line 1448)
- The `SectionComplete` component (used when `viewingCompletedSection` is true) is a simpler celebration view; we'll use `SectionSummary` instead for consistency
- The AI insight generation via `generate-section-summary` edge function will trigger when the summary page loads
