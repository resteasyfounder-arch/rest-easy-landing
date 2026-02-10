
## Dynamic Assessment CTA Text Across Logged-In Views

### Problem
The Results page shows a hardcoded "Start Assessment" button even when the user has an assessment in progress. This should dynamically reflect the user's actual progress.

### Changes

**File: `src/pages/Results.tsx` (lines ~239-250)**

The "no report" fallback currently hardcodes "Start Assessment." We'll use `useAssessmentState` to determine the correct label and description:

- Import `useAssessmentState` hook
- Check `assessmentState.status` and `assessmentState.overall_progress`:
  - `not_started` or progress = 0: "Start Assessment" + "Complete the Life Readiness assessment..."
  - `in_progress` / `draft` with progress > 0: "Continue Assessment (X%)" + "Continue your Life Readiness assessment..."
  - `completed`: "View Report" (though this path is unlikely here since no report exists)
- The description text will also update to match (e.g., "Continue your assessment to receive your personalized report")

**File: `src/components/dashboard/AssessmentCTA.tsx` (already dynamic)**

This component already handles all states correctly -- no changes needed.

**File: `src/pages/Profile.tsx` (lines ~323-340)**

The Profile page CTA already shows "Continue" vs "Review" based on status. No changes needed here either.

**File: `src/components/remy/RemyGuestChat.tsx`**

The "Start assessment" action here is for unauthenticated guest users, so it's correct as-is. No change needed.

### Summary

Only `src/pages/Results.tsx` needs updating. We'll import the `useAssessmentState` hook and make the no-report fallback button and description text dynamic based on actual assessment progress.
