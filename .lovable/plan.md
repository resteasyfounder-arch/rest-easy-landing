

## Redesign "Our Solution" Section to Horizontal Layout

### Overview
Convert the current vertical stacked card layout into a horizontal three-column pricing grid that feels polished and visually impactful.

### Layout Changes

**Current**: Single-column vertical stack with dashed connector lines between cards, max-width `2xl` (672px).

**New**: A responsive three-column grid (`grid-cols-1 lg:grid-cols-3`) spanning the full container width. On mobile, cards stack vertically. On desktop, all three sit side-by-side.

### Visual Enhancements

**1. Card styling upgrades**
- Remove the vertical dashed connector lines between cards
- The emphasized card (Step 2 - Life Readiness) gets elevated treatment: slightly scaled up (`lg:scale-105`), a `shadow-elevated` shadow, a subtle primary-tinted top border (`border-t-4 border-t-primary`), and a "Most Popular" badge
- Non-emphasized cards get `shadow-soft` with `hover:shadow-card` transition
- All cards become `flex flex-col` with the CTA button pushed to the bottom via `mt-auto`, ensuring uniform card heights

**2. Price styling**
- Larger price text (`text-4xl`) to create visual hierarchy
- "Free" price gets a green accent color (`text-primary`) to pop

**3. CTA buttons**
- Step 1 (Free): `variant="outline"` (stays the same)
- Step 2 (Emphasized): `variant="default"` full-width button with slightly larger padding
- Step 3 (Pro): `variant="default"` (stays the same)
- All CTAs become full-width (`w-full`) for consistency in the horizontal layout

**4. Container**
- Remove `max-w-2xl` constraint
- Use `max-w-6xl mx-auto` to give the three columns room to breathe
- Grid gap of `gap-6 lg:gap-4` with the middle card overlapping slightly via scale

### Technical Details

**File: `src/components/Solution.tsx`**

| Area | Change |
|------|--------|
| Outer grid | Replace `max-w-2xl flex flex-col` with `max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-4 items-center` |
| Connector lines | Remove the `{i > 0 && ...}` dashed line dividers |
| Emphasized card (Step 2) | Add `lg:scale-105 z-10`, `border-t-4 border-t-primary`, `shadow-elevated`, and a "Most Popular" ribbon/badge at top |
| All cards | Add `h-full flex flex-col` to Card, move CTA into a `mt-auto pt-4` wrapper for bottom-alignment |
| Price display | Bump to `text-4xl` for the price value |
| CTA buttons | All become `w-full` to fill the card width uniformly |

No new files or dependencies needed. Only `src/components/Solution.tsx` is modified.

