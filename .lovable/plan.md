

## Add "The Problem" Section to Landing Page

### Overview
Create a new, content-rich "Problem" section placed between the Hero/Journey sections and the Solution section. This section reframes the problem as one of ambiguity -- not motivation -- and positions Rest Easy as a readiness platform for unfinished business. It incorporates three uploaded photos and key statistics.

### Section Structure

The section will be broken into four visual blocks within a single component:

1. **Header** -- Badge ("The Problem") + headline ("This isn't a motivation problem. It's an ambiguity problem.") + supporting paragraph about overload vs. denial.

2. **Statistics Strip** -- Three stats in a horizontal card (76% No Will, 212+ Hours Lost, 30M Deaths Expected), reusing the same card/grid pattern already in `Problem.tsx`.

3. **Photo + Narrative Block** -- A two-column layout with an image on one side and narrative text on the other, alternating sides across three rows:
   - Row 1 (Image left: `Family_unprepared.png`): "Families don't struggle later because people didn't care..." paragraph about scattered information.
   - Row 2 (Image right: `prepared_person.png`): "Rest Easy is a Readiness Platform for unfinished business..." paragraph about clarity, not finality.
   - Row 3 (Image left: `Family_talking_about_end_of_life.png`): "We don't push people to finish tasks; we help them see..." paragraph with the four bullet points (Where things stand today / What's covered / What's missing / What matters most next).

4. **Closing line** -- "Nothing more. Nothing less." centered as a subtle typographic anchor.

### Files Changed

**New file: `src/components/landing/ProblemSection.tsx`**
- Self-contained component with all copy, stats, and image imports
- Uses `AnimatedSection` / `AnimatedItem` from `useScrollAnimation` for scroll-triggered fade-ups (consistent with other landing sections)
- Uses existing UI primitives: `Card`, `CardContent`, `Badge`, `Separator`
- Images imported from `src/assets/` as ES6 modules

**Copy uploaded images into project:**
- `user-uploads://Family_unprepared.png` to `src/assets/family-unprepared.png`
- `user-uploads://prepared_person.png` to `src/assets/prepared-person.png`
- `user-uploads://Family_talking_about_end_of_life.png` to `src/assets/family-talking.png`

**Edit: `src/pages/Index.tsx`**
- Import `ProblemSection` from `@/components/landing/ProblemSection`
- Place `<ProblemSection />` after `<JourneySection />` and before `<RemySection />`

**Edit: `src/components/landing/index.ts`**
- Add export for `ProblemSection`

**No other files changed.** The existing `src/components/Problem.tsx` will remain untouched (it is not currently used on the landing page).

### Technical Details

- Images rendered with `rounded-2xl object-cover` and constrained height (`h-64 lg:h-80`) to keep the section compact
- On mobile, images stack above their text block; on desktop they alternate left/right using `lg:flex-row` / `lg:flex-row-reverse`
- Stats strip reuses the same grid pattern from the existing `Problem.tsx` component
- Background: `bg-secondary/30` to provide subtle contrast from the white sections above and below
- All text uses existing `font-display` / `font-body` classes and muted color tokens
- The four "what Rest Easy shows you" bullets use `Check` icons from lucide-react in primary color

