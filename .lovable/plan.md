

## Add Page Preview Teasers to Feature Tour

### Overview
Enhance the existing feature tour so that each step displays a visual preview/mockup of the corresponding page alongside the text description. As the user clicks through tour steps, the preview updates with a smooth crossfade animation. These are lightweight, static mockup components -- not the actual pages -- designed to give users a taste of what each section looks like.

### What the User Will See

Each tour step will now show a preview card below (on mobile) or beside (on desktop) the step description. The previews are:

| Step | Preview Content |
|------|----------------|
| Home (Dashboard) | A mini progress hero card with a progress bar at 42%, "5 sections away" narrative text, and a journey timeline with 3 nodes (1 complete, 1 current, 1 locked) |
| My Profile | A compact life snapshot showing toggled life area chips (Family, Pets, Home, Finances) and a mini Trust Network section with 2 sample contact avatars |
| Life Readiness | A sample question card: "Do you have a current will?" with three answer options (Yes, Partially, No) and a progress indicator "Question 3 of 8" |
| Readiness Report | A mini report preview with a score circle (78), tier badge "Well Prepared", and section bars (Executive Summary, Key Strengths, Areas to Address) |
| EasyVault | A compact vault view with 3 document category rows (Legal, Financial, Healthcare) showing progress bars and document counts |

### Architecture

**New file: `src/components/tour/TourPreview.tsx`**
- A single component that accepts the step `id` and renders the corresponding mockup
- Uses a `switch` on the step id to render 5 different static mini-UIs
- All content is hardcoded/decorative (no real data) -- purely illustrative
- Wraps content in a container with `animate-fade-in` for smooth transitions between steps
- Uses existing UI primitives (Card, Progress, Badge) and Tailwind for styling

**Modified file: `src/components/tour/TourStep.tsx`**
- Import and render `TourPreview` between the description and the footer navigation
- Pass `step.id` to `TourPreview`
- Increase card width from `w-[320px]` to `w-[360px]` to accommodate the preview content

**Modified file: `src/components/tour/FeatureTour.tsx`**
- Update `computeCardPosition` to account for the taller card height (approximately 480px instead of 260px)
- Adjust the `vh - 260` clamp to `vh - 520` so the card stays on screen

### Technical Details

**TourPreview mockup approach:**
- Each mockup is a self-contained `div` approximately 140-180px tall
- Uses real Tailwind classes and existing design tokens (rounded-xl, border-border, bg-card, font-display, etc.) to match the app's visual language
- No animations within the previews (they are static snapshots) -- only the crossfade between them animates
- A subtle `rounded-lg border border-border/50 bg-muted/20 overflow-hidden` wrapper provides a "screenshot" feel

**Preview content details:**

1. **Dashboard preview**: A mini card with a progress bar, "42% complete" label, and 3 small circle nodes representing journey sections (green check, blue pulse, gray lock)

2. **Profile preview**: Horizontal row of pill-shaped chips ("Family", "Pets", "Home") with check icons, plus a "Trust Network" label with 2 overlapping avatar circles and "+3 more"

3. **Life Readiness preview**: A question "Do you have a current will?" with 3 styled answer rows (mimicking the AnswerButton style), one highlighted as selected, and a "Question 3 of 8" footer

4. **Report preview**: Score circle (78) with "Well Prepared" badge, followed by 3 section bars with colored dots (green for Strengths, amber for Gaps, blue for Actions) and skeleton text lines

5. **EasyVault preview**: 3 rows showing folder icon + category name + mini progress bar (Legal 2/4, Financial 1/3, Healthcare 0/2) with a lock icon footer "Encrypted storage"

**Crossfade animation:**
- The preview container uses a `key={step.id}` to trigger React remount
- CSS class `animate-fade-in` (already exists in the project) handles the entrance animation

**Card positioning adjustments:**
- The card is now taller (~480px total), so `computeCardPosition` needs to prefer placing the card vertically centered relative to the spotlight target
- On mobile (bottom nav), the card will appear above the nav with the preview stacked below the text
