

## Feature Tour / Tutorial Walkthrough

### Overview
A guided, step-by-step feature tour that highlights the five key sections of the app. It auto-launches on first login and can be re-triggered anytime via a help button in the navigation. Each step overlays a spotlight on the relevant nav item with a tooltip-style card explaining what the section does and how to use it.

### Tour Steps

| Step | Target | Title | Description |
|------|--------|-------|-------------|
| 1 | Home nav item | Your Home Base | Track your progress while your assessment is underway. Once complete, this becomes your dashboard -- a snapshot of your readiness score, report highlights, and action roadmap. |
| 2 | My Profile nav item | Your Life Snapshot | Keep your profile up to date as life changes. The questions and sections you see adapt based on what matters to you. You can also manage your Trust Network here -- the people you want to have access when it matters most. |
| 3 | Life Readiness nav item | Life Readiness Assessment | Personalized questions that adapt to your life. Work through them at your own pace -- your progress is saved automatically. Once complete, your Readiness Report will be generated. |
| 4 | Report nav item | Your Readiness Report | This is where the value comes together. Get a tailored gap analysis with prioritized next steps so you know exactly where to focus your end-of-life planning efforts. |
| 5 | EasyVault nav item | EasyVault Document Storage | Keep everything your loved ones will need in one place. Upload important documents, mark what does not apply to your life, and track your progress so nothing gets missed. |

### Architecture

**New files:**
- `src/components/tour/FeatureTour.tsx` -- Main tour component with overlay, spotlight, and step cards
- `src/components/tour/TourStep.tsx` -- Individual step tooltip/card UI
- `src/hooks/useFeatureTour.ts` -- Hook managing tour state (current step, open/close, localStorage persistence)

**Modified files:**
- `src/hooks/useFirstVisit.ts` -- Extend to also track whether the tour has been completed (new key `rest-easy.tour_complete`)
- `src/components/layout/DesktopLayout.tsx` -- Add a help/tour button in the header bar; render `FeatureTour` component
- `src/components/layout/BottomNav.tsx` -- Add data attributes to nav items so the tour can target them for spotlight positioning
- `src/components/layout/AppSidebar.tsx` -- Add data attributes to sidebar nav items for desktop spotlight targeting
- `src/components/layout/AppLayout.tsx` -- Render `FeatureTour` at the layout level so it works on both mobile and desktop
- `src/pages/Dashboard.tsx` -- Auto-trigger tour on first visit using `useFirstVisit` hook

### How It Works

1. **First login**: When a user lands on `/dashboard` for the first time (`useFirstVisit` returns `isFirstVisit: true`), the tour auto-starts.
2. **Step progression**: Each step highlights the corresponding nav item (sidebar on desktop, bottom nav on mobile) using a semi-transparent overlay with a spotlight cutout. A card appears next to the highlighted element with the title, description, and Next/Back/Skip controls.
3. **Completion**: On finishing or skipping, `markVisitComplete()` is called, persisting to localStorage so it does not show again.
4. **Re-trigger**: A small help icon button (e.g., `HelpCircle` from lucide) is added to the desktop header bar and as a floating button on mobile. Clicking it resets the tour to step 1.

### Technical Details

**`useFeatureTour.ts` hook:**
```
State: { isOpen, currentStep, totalSteps }
Actions: start(), next(), back(), skip(), close()
Persistence: localStorage key "rest-easy.tour_complete"
```

**Spotlight mechanics:**
- Each nav item gets a `data-tour="home"`, `data-tour="profile"`, etc. attribute
- The tour component queries `document.querySelector('[data-tour="..."]')` to get the element's bounding rect
- A full-screen overlay with `pointer-events-none` is rendered with a CSS clip-path or box-shadow cutout around the target element
- The step card is absolutely positioned relative to the target

**Step card UI:**
- Warm card style consistent with the app (rounded-xl, soft shadow, primary accent)
- Step indicator dots at the bottom (e.g., "2 of 5")
- Three buttons: Back (disabled on step 1), Next/Finish, and a subtle Skip link
- Smooth fade/slide animation between steps using existing `animate-fade-in` / `animate-scale-in`

**Re-trigger button placement:**
- Desktop: In the `DesktopLayout` header, next to the sidebar trigger -- a `HelpCircle` icon button with tooltip "Feature Tour"
- Mobile: In the `BottomNav` area or as a small floating action button; alternatively added to the Menu page as a menu item

**No external dependencies required** -- built entirely with existing UI primitives (Card, Button, Portal via React portals) and Tailwind utilities.

