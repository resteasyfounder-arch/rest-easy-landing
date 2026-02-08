

## Fix Active Section Highlighting in Navigation

### Problems Identified

1. **Auto-highlights on load**: The Problem section sits right below the hero, so the IntersectionObserver immediately detects it as intersecting on page load -- even before the user scrolls. The nav should show no active state until the user actually scrolls down or clicks a nav link.

2. **Unreliable transitions**: The current observer only sets active on `isIntersecting: true`. When scrolling quickly between sections, multiple entries can fire and the last one wins unpredictably. The observer needs to track which section is most visible or use a more robust approach.

### Solution

**Rewrite `src/hooks/useActiveSection.ts`** with two fixes:

1. **Scroll threshold gate**: Track whether the user has scrolled past a minimum distance (e.g., the hero section height, roughly `window.innerHeight * 0.5`). Until that threshold is crossed, return `null` -- no section is highlighted. Once the user scrolls back to the top (above the threshold), reset to `null` again so the nav goes back to its neutral state.

2. **Better section detection**: Instead of relying solely on IntersectionObserver `isIntersecting`, use a scroll event listener that checks each section's `getBoundingClientRect()` position relative to the viewport. The section whose top is closest to (but not below) a target line (~20-25% from top of viewport) wins. This is more reliable for adjacent sections.

**Update `src/components/Header.tsx`**:

3. **Click-to-activate**: When a nav link is clicked, immediately set the active section to that item's id (so the pill animates instantly on click), then let the scroll listener take over once scrolling settles.

### Technical Details

**`src/hooks/useActiveSection.ts`** -- full rewrite:

```
function useActiveSection(sectionIds: string[]):
  - State: activeSection (string | null), starts null
  - On scroll event (throttled with requestAnimationFrame):
    - If scrollY < threshold (~300px), set activeSection to null and return
    - Loop through sectionIds, get each element's getBoundingClientRect()
    - Find the section whose top is closest to 20% of viewport height (from above)
    - Set that as activeSection
  - Cleanup: remove scroll listener
  - Return activeSection
```

Key behaviors:
- Returns `null` when user is at the top of the page (hero visible) -- no pill is highlighted
- Accurately tracks the "current" section during smooth scrolling
- Uses `requestAnimationFrame` for scroll throttling to avoid performance issues

**`src/components/Header.tsx`** -- minor update:
- When a nav button is clicked, call a setter to force the active section immediately (for instant visual feedback), then `scrollToSection()` as before
- The hook can expose a `setOverride` function, or the Header can manage a local override state that clears after a short delay (letting the scroll listener take back over)

### Files Changed
- **Edit:** `src/hooks/useActiveSection.ts` -- rewrite with scroll-based detection and top-of-page null state
- **Edit:** `src/components/Header.tsx` -- add click-to-activate immediate feedback

