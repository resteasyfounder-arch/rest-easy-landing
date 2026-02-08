

## Remove Remy Inline Nudges from the Life Readiness Assessment

### Scope

This change **only** affects `src/pages/Readiness.tsx`. The Remy Brief Card on the Dashboard is a completely separate component (`RemyBriefCard`) and will **not** be touched. Remy features on Profile, Menu, Results, and Dashboard pages all remain intact.

### What Gets Removed

Six items will be cleaned up from `src/pages/Readiness.tsx`:

1. **Imports (lines 12-13)**: Remove `notifyRemyRefresh`, `useRemySurface`, and `RemyInlineNudge` imports.

2. **Remy surface variables (lines 760-767)**: Remove the `remySurface`, `remySectionId`, and `remyEnabled` computed values that configure which Remy surface to query.

3. **`useRemySurface` hook call (lines 769-780)**: Remove the hook and all its destructured return values (`remyPayload`, `isLoadingRemy`, `remyError`, `dismissNudge`, `acknowledgeAction`).

4. **`notifyRemyRefresh()` calls (~4 occurrences)**: Remove the refresh triggers at lines 848, 903, 961, and 1062 that fire after profile saves and answer saves.

5. **`<RemyInlineNudge>` in section summary view (line 1425)**: Remove the nudge card that appears at the top of the section summary content area.

6. **`<RemyInlineNudge>` in assessment question view (line 1806)**: Remove the nudge card that appears above the question card during active assessment.

### What Stays Unchanged

| Page | Remy Feature | Status |
|------|-------------|--------|
| Dashboard | `RemyBriefCard` with priorities and nudge | Kept |
| Profile | `RemyInlineNudge` | Kept |
| Menu | `RemyInlineNudge` | Kept |
| Results | `useRemySurface` + priority list | Kept |
| Global | `RemyGlobalLauncher` | Kept |

### Risk

None. The removed code is self-contained within Readiness.tsx and has no side effects on other pages. The `notifyRemyRefresh()` calls being removed only triggered Remy re-fetches on the Readiness page itself, so removing them has no impact elsewhere.

