
## Widen the Findability Results Page for Larger Screens

### The Problem

The results page container is capped at `max-w-lg` (512px), which looks narrow and overly long on desktop/tablet screens. Mobile is fine as-is.

### The Solution

Use responsive Tailwind classes to widen the container on larger screens and arrange some content side-by-side in a two-column grid, reducing vertical scrolling while keeping the mobile layout unchanged.

### Technical Changes

**`src/components/assessment/FindabilityResults.tsx`** (main layout file)

- Change the container from `max-w-lg` to `max-w-lg md:max-w-3xl` (768px on desktop)
- Wrap the Score Hero and Remy Summary into a two-column grid on `md:` screens so the score circle sits beside the AI summary
- Wrap Action Plan and Breakdown into a second two-column grid on `md:` screens
- Life Readiness Teaser, Trust Section, and CTA remain full-width as they are conversion-focused and benefit from visual prominence

**No changes to any child components** -- the layout adjustments happen entirely in the parent container using Tailwind's responsive grid utilities.

### Resulting Layout

On mobile (unchanged):
```text
+---------------------------+
| Score Hero                |
| Remy Summary              |
| Action Plan               |
| Breakdown                 |
| Life Readiness Teaser     |
| Trust Badges              |
| CTA                       |
+---------------------------+
```

On desktop (md and above):
```text
+---------------------------------------------+
|  Score Hero       |  Remy Summary            |
+---------------------------------------------+
|  Action Plan      |  Breakdown               |
+---------------------------------------------+
|  Life Readiness Teaser (full width)          |
+---------------------------------------------+
|  Trust Badges (full width)                   |
+---------------------------------------------+
|  CTA (full width)                            |
+---------------------------------------------+
```
