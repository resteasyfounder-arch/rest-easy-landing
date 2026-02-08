

## Clean Up Pricing Section: Move Feature Descriptions Below Cards

### Problem
Each tier card repeats the same 6 feature names AND descriptions, making the cards long and cluttered. The duplicated text across 3 columns feels redundant.

### Solution
Split the section into two parts:

1. **Tier Cards (top)** -- Compact cards showing only the tier info (icon, name, tagline, price, CTA) and a simple checklist of feature names with check/dash icons -- no descriptions.
2. **Feature Breakdown (below)** -- A single, clean section underneath the cards that lists each feature once with its description and a row of 3 indicators showing which tiers include it.

---

### Layout

```text
[  Discover  ]  [  Readiness  ]  [  Rest Easy Pro  ]
   Icon             Icon              Icon
   Free             $99              $14.99/mo
   [CTA]            [CTA]            [CTA]
   ---              ---               ---
   * Feature 1      * Feature 1       * Feature 1
   - Feature 2      * Feature 2       * Feature 2
   - Feature 3      * Feature 3       * Feature 3
   ...              ...               ...


========== What's Included ==========

  Findability Assessment
  "Quick check to see how easily..."
  [check] Discover  [check] Readiness  [check] Pro

  Life Readiness Assessment
  "Comprehensive evaluation across..."
  [dash] Discover   [check] Readiness  [check] Pro

  ... (remaining features)
```

---

### Technical Details

**File:** `src/components/Solution.tsx`

**Card changes:**
- Keep feature checklist inside each card but remove the `description` span -- show only feature names with check/dash icons
- This makes cards much shorter and scannable

**New section below cards:**
- Add a "What's Included" heading after the tier grid
- Render each feature as a row with:
  - Feature name (bold) and description (muted text below)
  - Three small indicators (one per tier) showing check or dash, labeled with the tier name
- Use a simple grid or stacked layout with subtle dividers between features
- Wrap in `AnimatedSection` for consistent scroll animation
- Use existing `Separator` component between feature rows

No new files or dependencies needed.

