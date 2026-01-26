
## Fix Plan: Dashboard Score and Profile Status Issues

### Problem Summary
1. **Score display issue**: Users see a score (e.g., 67) after completing only 1 section, which is misleading
2. **Profile status mismatch**: "Complete Your Profile" button appears while profile is also shown as complete

### Root Causes

#### Issue 1: Misleading Score
The server calculates `overall_score` as a weighted average of **only completed sections**, not all sections. This is technically correct for scoring but confusing when the assessment is in progress.

#### Issue 2: Profile Status Conflict
Two different data sources are used:
- `useGuestProfile` hook: counts localStorage keys against hardcoded `TOTAL_PROFILE_QUESTIONS = 8`
- `useAssessmentState` hook: gets `profile_complete` from server (based on schema)

When these disagree, the UI shows contradictory information.

---

### Solution

#### Change 1: Show "In Progress" State Instead of Score

When the assessment is not complete, show a different visual treatment on the dashboard that emphasizes progress rather than score.

**File: `src/pages/Dashboard.tsx`**

Replace the Score Card content based on completion status:
- **Incomplete assessment**: Show progress ring (not score), "Assessment In Progress" label, and progress percentage
- **Complete assessment**: Show the actual score circle with tier badge as currently

```tsx
// In the Main Score Card section
{isComplete ? (
  // Show actual score - assessment is done
  <ScoreCircle
    score={assessmentState.overall_score}
    tier={assessmentState.tier}
    size="lg"
    animated={true}
  />
) : (
  // Show progress ring - assessment in progress
  <ProgressCircle 
    progress={assessmentState.overall_progress}
    label="In Progress"
  />
)}
```

Also update the heading text:
- Incomplete: "Your Assessment Progress"
- Complete: "Your Readiness Score"

#### Change 2: Single Source of Truth for Profile Completion

Use **only the server state** (`assessmentState.profile_complete`) for determining profile completion status. The localStorage profile is a cache, not the source of truth.

**File: `src/pages/Dashboard.tsx`**

Update the profile progress card to use server state:
```tsx
// Line 139-155 - Use server state for profile progress
{!assessmentState.profile_complete && (
  <Card className="border-border/50">
    <CardContent className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display font-medium text-foreground">Profile Completion</h3>
        <span className="text-sm text-muted-foreground">
          {assessmentState.profile_progress}%
        </span>
      </div>
      <Progress value={assessmentState.profile_progress} className="h-2" />
      ...
    </CardContent>
  </Card>
)}
```

#### Change 3: Fix AssessmentCTA Logic

**File: `src/components/dashboard/AssessmentCTA.tsx`**

The "Complete Your Profile" logic should only check `profile_complete`, not combine it with `overall_progress`:

```tsx
// Line 26-35 - Simplify profile check
// Profile incomplete - prompt to complete profile
if (!profile_complete) {
  return (
    <Button asChild size="lg" className={className}>
      <Link to="/readiness" className="gap-2">
        <ArrowRight className="h-4 w-4" />
        Complete Your Profile
      </Link>
    </Button>
  );
}
```

#### Change 4: Create ProgressCircle Component (Optional Enhancement)

**File: `src/components/dashboard/ProgressCircle.tsx`**

Create a new component similar to `ScoreCircle` but designed for "in progress" state:
- Shows percentage progress (0-100%)
- Uses a neutral/blue color scheme (not tier-based)
- Displays "In Progress" text instead of tier label

---

### Summary of Changes

| File | Change |
|------|--------|
| `src/pages/Dashboard.tsx` | Conditionally show progress vs score based on `isComplete`; use server state for profile progress |
| `src/components/dashboard/AssessmentCTA.tsx` | Fix profile check to only use `profile_complete` flag |
| `src/components/dashboard/ProgressCircle.tsx` | New component for in-progress visual (optional) |
| `src/components/dashboard/index.ts` | Export new component |

### Expected Behavior After Fix

1. **Incomplete assessment**: Dashboard shows "Assessment In Progress" with progress ring showing 12% (or whatever the actual progress is), not a misleading score
2. **Complete assessment**: Dashboard shows actual score with tier badge
3. **Profile status**: Single consistent state - either show the profile completion card OR don't, based on server truth
4. **CTA button**: Shows "Complete Your Profile" only when server says profile is incomplete
