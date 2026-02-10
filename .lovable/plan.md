

## Redesign Findability Results Page Layout

### What Changes

Reorganize the results page for better visual flow on desktop, remove the ActionPlanPreview ("Create Your 'Start Here' Guide") section, and expand the LifeReadinessTeaser to show all 11 Life Readiness categories (4 visible, 7 locked). The page order becomes: results/score/breakdown at the top, sign-up content at the bottom.

### New Page Order

```text
Mobile (single column):            Desktop (md: two columns):
+---------------------------+      +-------------------------------------------+
| Score Hero                |      |  Score Hero       |  Remy's Take          |
| Remy's Take               |      +-------------------------------------------+
| Your Breakdown            |      |  Your Breakdown (full width)              |
| Life Readiness Teaser     |      +-------------------------------------------+
| Trust Badges              |      |  Life Readiness Teaser (full width)       |
| CTA                       |      +-------------------------------------------+
+---------------------------+      |  Trust Badges                             |
                                   +-------------------------------------------+
                                   |  CTA                                      |
                                   +-------------------------------------------+
```

### Technical Changes

**1. `src/components/assessment/FindabilityResults.tsx`**
- Remove the `ActionPlanPreview` import and usage
- Move `ResultsBreakdown` out of the two-column grid and make it full-width (it has 8 accordion items -- better full-width)
- Keep Score Hero + Remy Summary in a side-by-side grid on desktop
- Order: ScoreHero/Remy grid, Breakdown (full-width), LifeReadinessTeaser, TrustSection, CTA

**2. `src/components/assessment/results/LifeReadinessTeaser.tsx`**
- Update subtitle text: "Your full Life Readiness Score covers 11 categories" (was 5)
- Replace the current 5 hardcoded categories with the actual 11 from the readiness schema
- Show the first 4 categories as "preview" items (unlocked styling with category icons)
- Show the remaining 7 as a single collapsed/locked row: "+7 more categories" with a lock icon
- Keep the "See Your Full Score" button

### What Gets Removed
- `ActionPlanPreview` component usage (the "Create Your 'Start Here' Guide" card) -- the component file stays in the codebase

### What Stays Unchanged
- `ResultsScoreHero`, `RemySummaryCard`, `ResultsBreakdown`, `ResultsTrustSection`, `ResultsCTA` -- no internal changes
- Mobile layout remains single-column stacked
- `ActionPlanPreview.tsx` file remains in the codebase
