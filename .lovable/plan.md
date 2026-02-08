

## Redesign Landing Page Navigation with Active Section Highlighting

### Overview
Improve the header navigation design and add scroll-spy active section highlighting so visitors always know where they are on the page.

### Design Improvements

**Desktop:**
- Replace plain text buttons with a pill-style nav group: a subtle `bg-secondary/50` rounded container holding the links, giving them visual structure
- Active link gets a solid `bg-primary text-primary-foreground` pill/chip treatment with a smooth transition
- Inactive links remain `text-muted-foreground` with hover state
- Slightly increase spacing and add `font-body` for consistency
- Reduce CTA button text from "Get Your Findability Score" to "Get Started" to save horizontal space and balance the bar

**Mobile:**
- Replace the two-row layout (logo row + links row) with a single-row layout: logo left, compact horizontal pill nav right
- Active link gets a small underline indicator (2px bottom border in primary color) instead of a pill (saves space)
- Keep `text-xs` sizing but tighten gaps

### Active Section Highlighting (Scroll Spy)

Add a `useActiveSection` hook (or inline logic in Header) using `IntersectionObserver`:
- Observe each section element (`#problem`, `#journey`, `#remy`, `#solution`)
- Track which section is currently most visible in the viewport
- Update an `activeSection` state variable
- Apply active styles to the matching nav link

### Technical Details

**New hook: `src/hooks/useActiveSection.ts`**
```typescript
// Uses IntersectionObserver with rootMargin to detect
// which section is in the upper portion of the viewport
// Returns the id string of the active section
```

- Observes elements by their `id` attributes
- Uses `rootMargin: "-20% 0px -75% 0px"` so the section is considered "active" when it enters the top ~25% of the viewport
- Cleans up observers on unmount
- Returns `null` when no section is intersecting (e.g., user is at the very top in the hero)

**Edit: `src/components/Header.tsx`**
- Import and use `useActiveSection` hook
- Desktop: wrap nav items in a `rounded-full bg-secondary/50 px-1.5 py-1.5` container; each item becomes a `rounded-full px-4 py-1.5` button; active item gets `bg-primary text-primary-foreground`
- Mobile: single row with logo left, scrollable nav right; active item gets `text-foreground` + a `border-b-2 border-primary` underline
- Add `transition-all duration-200` for smooth active state changes
- Shorten CTA text to "Get Started"

### Files Changed
- **New:** `src/hooks/useActiveSection.ts` -- IntersectionObserver-based scroll spy hook
- **Edit:** `src/components/Header.tsx` -- redesigned layout + active highlighting for both desktop and mobile

