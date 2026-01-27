
# Plan: Hide Partial Scores & Show Motivational Progress

## Problem

Currently, when a user completes only 1 of several sections, they see a "Readiness Score" of 51 with a tier badge like "On Your Way" - but this is the score for just that one section, not their overall readiness. This creates confusion and sets misleading expectations.

## Solution Overview

Replace numeric scores with progress-focused UI throughout the app until the assessment is fully complete. Users will see:

- **Progress percentage** (how much they've completed)
- **Section counts** ("3 of 7 sections completed")
- **Motivational messages** ("You're making great progress!")
- **Visual journey progress** (filled sections on a path)

Once complete, the full score and tier are revealed as a "moment of accomplishment."

## Visual Concept

```text
+------------------------------------------+
|  DURING ASSESSMENT (Current: Misleading) |
+------------------------------------------+
|   ┌────────────┐                         |
|   │    51     │  "On Your Way" Badge    |
|   │   Score    │  ← MISLEADING!          |
|   └────────────┘                         |
+------------------------------------------+

+------------------------------------------+
|  DURING ASSESSMENT (Proposed: Clear)     |
+------------------------------------------+
|   ┌────────────┐                         |
|   │    25%    │  "Making Great Progress" |
|   │  Complete  │  3 of 7 sections done   |
|   └────────────┘                         |
|                                          |
|   "Complete all sections to see your     |
|    personalized Readiness Score"         |
+------------------------------------------+

+------------------------------------------+
|  AFTER COMPLETION (Score Revealed)       |
+------------------------------------------+
|   ┌────────────┐                         |
|   │    78     │  🎉 "Well Prepared"      |
|   │   Score    │  "Your Life Readiness"  |
|   └────────────┘                         |
+------------------------------------------+
```

## Detailed Changes

### 1. Dashboard Main Card (src/pages/Dashboard.tsx)

**Currently shows**: ScoreCircle with `overall_score` + TierBadge when not complete

**Change to**: 
- Show ProgressCircle (already exists) with percentage complete
- Add motivational text based on progress milestone
- Add section count ("3 of 7 sections completed")
- Add gentle prompt: "Complete all sections to reveal your score"

```tsx
// Instead of ScoreCircle during progress
<ProgressCircle progress={assessmentState.overall_progress} />
<p className="text-muted-foreground">
  {completedSectionsCount} of {totalSections} sections completed
</p>
<p className="text-sm text-muted-foreground/80 italic">
  Complete all sections to see your personalized Readiness Score
</p>
```

### 2. Sidebar Score Preview (src/components/layout/AppSidebar.tsx)

**Currently shows**: Numeric `overall_score` + TierBadge + Progress bar

**Change to**:
- During assessment: Show progress percentage + section count
- After completion: Reveal score + tier badge
- Add conditional rendering based on `isComplete`

```tsx
// In-progress state
<span className="text-lg font-display font-bold text-primary">
  {isComplete ? assessmentState.overall_score : `${Math.round(assessmentState.overall_progress)}%`}
</span>
<span className="text-xs text-muted-foreground">
  {isComplete ? "Your Score" : "Progress"}
</span>
```

### 3. Section Progress Cards (src/components/dashboard/SectionProgressCard.tsx)

**Currently shows**: Section score badge when completed (e.g., "73%")

**Option A (Conservative)**: Keep section scores visible - they're accurate for that section
**Option B (Cleaner)**: Hide section scores too, just show ✓ checkmark

Recommendation: **Option A** - Keep section scores as they are accurate and help users understand their performance in each area. The problem is the *overall* score, not section scores.

### 4. New Motivational Messages Component

Create a helper function that returns encouraging messages based on progress:

```tsx
const getProgressMessage = (progress: number, sectionsComplete: number, totalSections: number) => {
  if (sectionsComplete === 0) return "Ready to begin your journey?";
  if (sectionsComplete === 1) return "Great start! Keep going.";
  if (progress < 50) return "You're making progress!";
  if (progress < 75) return "More than halfway there!";
  if (progress < 100) return "Almost finished!";
  return "Assessment complete!";
};
```

### 5. Results Page Guard (Already OK)

The Results page (src/pages/Results.tsx) already fetches from the server and only shows the report if it exists. No changes needed here.

## Summary of Component Changes

| Component | Current Behavior | New Behavior |
|-----------|------------------|--------------|
| Dashboard main card | Shows `overall_score` + tier during progress | Shows `overall_progress %` + section count + motivational text |
| AppSidebar | Shows `overall_score` always | Shows `% complete` during progress, score after completion |
| SectionProgressCard | Shows section score % on completion | No change (section scores are accurate) |
| TierBadge | Shown during progress | Only shown after assessment is complete |

## Files to Modify

1. **src/pages/Dashboard.tsx** - Update main score card rendering logic
2. **src/components/layout/AppSidebar.tsx** - Conditional score vs. progress display
3. **src/components/dashboard/index.ts** - Export any new components (if created)

## Edge Cases Handled

- **Returning user at 0%**: Shows "Ready to begin?" prompt
- **One section done**: Shows "1 of 7 sections • Great start!"
- **99% complete**: Shows "Almost finished!" encouragement
- **100% complete**: Reveals score with celebration moment
- **Report generating**: Shows "Preparing your report..." state (already exists)

## Benefits

- No more misleading partial scores
- Clear progress tracking motivates completion
- Score reveal becomes a rewarding moment
- Simpler UI during the assessment journey
- Aligns with "system invisible" UX principle from project memory
