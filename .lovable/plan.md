

## Add Navigation Bar to Assessment Results Page

The assessment page currently uses a full-screen overlay (`fixed inset-0 z-50`) with no persistent navigation. The results view needs a nav bar matching the landing page header style -- logo linking home, plus a "Log In" button.

### Changes

**File: `src/components/assessment/FindabilityResults.tsx`**

Add a sticky header at the top of the results view with:
- Rest Easy logo on the left, linking to `/` (home)
- "Log In" button on the right, linking to `/login`
- Same styling as the landing page header: `fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50`
- Mobile: logo height `h-8`, header height `h-14`
- Desktop: logo height `h-10`, header height `h-16`
- Add top padding to the content area (`pt-16 md:pt-20`) to account for the fixed header

No section scroll-spy nav items needed since this isn't the landing page -- just the logo and auth actions.

**File: `src/pages/Assessment.tsx`**

In the results step render block (line 228-239), remove the inner header/close button since the new nav bar in `FindabilityResults` handles navigation. The `fixed inset-0` wrapper remains so the results page is full-screen.

### Technical Details

| File | Change |
|------|--------|
| `src/components/assessment/FindabilityResults.tsx` | Import logo asset and `Link` from react-router-dom. Add fixed header with logo (links to `/`) and "Log In" button (links to `/login`). Adjust content top padding. |
| `src/pages/Assessment.tsx` | No changes needed -- the results wrapper already has no competing header. |
