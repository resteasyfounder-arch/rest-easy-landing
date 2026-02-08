

## Update Landing Page Navigation Bar

### Overview
Add section-based anchor links to the public landing page header so visitors can quickly jump to key sections. This navigation is completely separate from the logged-in sidebar/bottom nav -- it only appears on the unauthenticated homepage.

### Current State
- The `Header` component shows logo + "Log In" / "Get Your Findability Score" buttons on desktop, and just a centered logo on mobile.
- Landing page sections (Hero, Problem, Journey, Remy, Solution, Footer) don't have consistent `id` attributes for anchor scrolling.

### Changes

**1. Add `id` attributes to each landing section**

Each section component needs an `id` so the nav links can scroll to them:

| File | Add `id` |
|------|----------|
| `src/components/landing/ProblemSection.tsx` | `id="problem"` on the `<section>` |
| `src/components/landing/JourneySection.tsx` | `id="journey"` on the `<section>` |
| `src/components/landing/RemySection.tsx` | `id="remy"` on the `<section>` |
| `src/components/Solution.tsx` | Already has `id="solution"` -- no change needed |

**2. Update `src/components/Header.tsx` (desktop)**

Add section navigation links between the logo and the auth buttons:

```text
[ Logo ]    [ The Problem | Your Journey | Meet Remy | Our Solution ]    [ Log In ] [ Get Your Findability Score ]
```

- Each link calls `scrollIntoView({ behavior: "smooth" })` on the target section element
- Links styled with `text-sm font-medium text-muted-foreground hover:text-foreground` for a subtle, clean look
- Active section highlighting is not needed for v1 -- simple scroll links are sufficient

**3. Update `src/components/Header.tsx` (mobile)**

Add a compact horizontal scrollable row of section links below the logo, or use a hamburger menu. Given the current mobile pattern (centered logo only), the simplest approach:

- Add the section links as a slim horizontal row beneath the logo bar, using `text-xs` sizing and `gap-4` spacing
- The header height increases slightly to accommodate, and the hero section's top padding adjusts accordingly
- Alternatively, if space is tight, show a small menu icon that opens a dropdown with section links

**4. No changes to logged-in navigation**

The `AppSidebar`, `DesktopLayout`, and `BottomNav` components remain untouched. The `Header` already returns `null` for authenticated users, so this separation is already enforced.

### Technical Details

- Smooth scroll helper function added inside `Header.tsx`:
  ```typescript
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };
  ```
- Nav items defined as a simple array: `[{ label: "The Problem", id: "problem" }, { label: "Your Journey", id: "journey" }, { label: "Meet Remy", id: "remy" }, { label: "Our Solution", id: "solution" }]`
- On mobile, links displayed as a centered horizontal row with `overflow-x-auto` for safety, using smaller text
- The header remains `fixed top-0` with backdrop blur -- no structural change to positioning
- Hero section may need a minor top-padding tweak on mobile if the header height increases

### Files Modified
- `src/components/Header.tsx` -- add section nav links for both desktop and mobile
- `src/components/landing/ProblemSection.tsx` -- add `id="problem"`
- `src/components/landing/JourneySection.tsx` -- add `id="journey"`
- `src/components/landing/RemySection.tsx` -- add `id="remy"`
