

## Reinvent the "Solution" Section as a Pricing Tiers Display

Transform the current two-path card into a polished three-tier pricing section that clearly communicates the value progression from free to premium.

---

### Tier Breakdown

| | Discover (Free) | Readiness ($99 one-time) | Rest Easy Pro ($199 one-time) |
|---|---|---|---|
| Findability Assessment | Yes | Yes | Yes |
| Life Readiness Assessment | -- | Yes | Yes |
| Personalized Report | -- | Yes | Yes |
| Actionable Roadmap | -- | -- | Yes |
| EasyVault Document Storage | -- | -- | Yes |
| Remy AI Guide | -- | -- | Yes |

---

### Design Approach

A horizontal three-column layout (stacks vertically on mobile) with the middle tier visually highlighted as "Most Popular." Each tier card includes:

- **Icon** at the top representing the tier theme
- **Tier name** and short tagline
- **Price** prominently displayed (Free / $99 / $199)
- **Feature checklist** with checkmarks for included features and dimmed dashes for excluded ones
- **CTA button** -- outline for free, solid primary for the highlighted tier, solid for premium

The middle card ("Readiness") gets a subtle border highlight and a "Most Popular" badge to draw attention. The premium card gets a subtle gradient background to feel aspirational.

---

### File Changes

**`src/components/Solution.tsx`** -- Full rewrite of the component:

- Replace the two-column card layout with a three-column pricing grid
- Update the section header badge from "Two Paths Forward" to "Choose Your Path"
- Update the headline to something like "Find your level of readiness"
- Each tier rendered as its own card with:
  - Tier icon (Search for Discover, Activity for Readiness, Shield for Rest Easy Pro)
  - Name, tagline, and price
  - Feature list with Check/Minus icons showing inclusion
  - CTA button linking to the appropriate route (/assessment, /readiness, /readiness)
- Use the existing `AnimatedSection` wrapper for scroll animation
- Mobile: single column stack; Tablet+: three columns side by side
- Middle tier card uses `border-primary` and a "Most Popular" badge
- Premium tier uses a subtle `bg-primary/5` background

No new files or dependencies needed -- this is a self-contained component rewrite using existing UI primitives (Card, Badge, Button, lucide icons).

---

### Visual Hierarchy (top to bottom per card)

```text
+---------------------------+
|  [Icon]                   |
|  TIER NAME                |
|  Short tagline            |
|                           |
|  $0 / $99 / $199          |
|  "one-time" or "free"     |
|                           |
|  [CTA Button]             |
|                           |
|  --- Feature List ---     |
|  [check] Feature 1        |
|  [check] Feature 2        |
|  [dash]  Feature 3        |
|  [dash]  Feature 4        |
+---------------------------+
```

The middle card is slightly taller with a top badge reading "Most Popular" and a primary-colored border. The premium card has a warm background tint to feel like the aspirational choice.

