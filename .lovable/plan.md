

## Smooth Out Landing Page Background Flow

### Problem
Every section uses the same `bg-gradient-hero` class, which applies a diagonal gradient (`135deg`). Because each section restarts the same gradient independently, there are visible "seams" where sections meet -- the gradient pattern repeats at each boundary rather than flowing continuously.

### Solution
Remove individual section backgrounds and instead apply a single, continuous background to the entire `<main>` element in `Index.tsx`. This way the gradient renders once across the full page height, creating a seamless flow from hero through to the footer.

### Changes

**`src/pages/Index.tsx`**
- Add `bg-gradient-hero` to the `<main>` wrapper so the gradient covers all sections in one continuous sweep.

**`src/components/Hero.tsx`**
- Remove `bg-gradient-hero` from the hero `<section>` (it will inherit from `<main>`).

**`src/components/landing/ProblemSection.tsx`**
- Remove `bg-gradient-hero` from the section element.

**`src/components/Solution.tsx`**
- Remove `bg-gradient-hero` from the section element.

**`src/components/landing/JourneySection.tsx`**
- Remove `bg-gradient-hero` from the section element.

**`src/components/landing/RemySection.tsx`**
- Remove `bg-gradient-hero` from the section element.

All sections will then sit on one continuous gradient background with no visible seams between them. The footer retains its own dark `bg-foreground` background, which provides a clean visual break.

