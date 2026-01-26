

# Refactor Assessment Flow to Backend-Only State Management

## Overview

This plan removes localStorage caching for assessment data and establishes the backend as the single source of truth. Only the `subject_id` will be kept in localStorage as a session identifier to link browser sessions to server data.

## Current State Analysis

### localStorage Keys Currently Used

| Key | Location | Purpose |
|-----|----------|---------|
| `rest-easy.readiness.subject_id` | Multiple files | Session identifier (KEEP) |
| `rest-easy.readiness.assessment_id` | Multiple files | Cached assessment ID (REMOVE) |
| `rest-easy.readiness.profile_json` | Readiness.tsx, useGuestProfile | Cached profile data (REMOVE) |
| `rest-easy.readiness.profile_answers` | Readiness.tsx, useGuestProfile | Cached profile answers (REMOVE) |
| `rest-easy.readiness.answers` | Readiness.tsx | Cached assessment answers (REMOVE) |
| `rest-easy.readiness.flow_phase` | Readiness.tsx | Cached flow phase (REMOVE) |
| `rest-easy.readiness.cached_state` | useAssessmentState | Cached server state (REMOVE) |
| `rest-easy.readiness.report` | Results.tsx, AssessmentCTA | Cached report (REMOVE) |
| `rest-easy.readiness.report_stale` | Readiness.tsx | Report staleness flag (REMOVE) |

### Files Requiring Changes

1. **`supabase/functions/agent/index.ts`** - Expand `get_state` response to include full data
2. **`src/pages/Readiness.tsx`** - Major refactor to fetch-first pattern
3. **`src/hooks/useAssessmentState.ts`** - Simplify to server-only fetching
4. **`src/hooks/useGuestProfile.ts`** - Remove or simplify significantly
5. **`src/pages/Results.tsx`** - Fetch report from server
6. **`src/components/dashboard/AssessmentCTA.tsx`** - Remove localStorage checks

---

## Phase 1: Expand Edge Function Response

### Goal
Make `get_state` return ALL data needed to hydrate the Readiness page.

### Changes to `supabase/functions/agent/index.ts`

Update the `AssessmentState` interface and `computeAssessmentState` function to include:

```typescript
interface AssessmentState {
  // Existing fields...
  
  // NEW: Full data for client hydration
  profile_data: Record<string, unknown>;           // Full profile JSON
  profile_answers: Record<string, "yes" | "no">;   // Profile question answers
  answers: Record<string, AnswerRecord>;           // All assessment answers
  flow_phase: FlowPhase;                           // Current flow phase
}
```

The edge function will:
- Return profile data from `profile_intake` table
- Return all answers from `assessment_answers` table with full details
- Calculate and return the appropriate `flow_phase` based on progress

---

## Phase 2: Refactor Readiness.tsx

### Goal
Remove all localStorage reads/writes for assessment data. Fetch everything from server on mount.

### Key Changes

1. **Remove STORAGE_KEYS object** (except `subjectId`)

2. **Remove localStorage initialization** from useState calls:
   ```typescript
   // BEFORE: Reads from localStorage
   const [answers, setAnswers] = useState<Record<string, AnswerRecord>>(() => {
     const raw = localStorage.getItem(STORAGE_KEYS.answers);
     return raw ? JSON.parse(raw) : {};
   });
   
   // AFTER: Empty initial state, populated from server
   const [answers, setAnswers] = useState<Record<string, AnswerRecord>>({});
   ```

3. **Remove all localStorage.setItem calls** for:
   - `profile`
   - `profileAnswers`
   - `answers`
   - `flowPhase`
   - `assessmentId`

4. **Update bootstrap() function** to hydrate ALL state from server:
   ```typescript
   const bootstrap = useCallback(async () => {
     setLoading(true);
     try {
       const storedSubjectId = localStorage.getItem(STORAGE_KEYS.subjectId);
       
       const [schemaResponse, stateResponse] = await Promise.all([
         callAgent({
           action: "get_schema",
           assessment_id: ASSESSMENT_ID,
           schema_version: SCHEMA_VERSION,
         }),
         callAgent({
           action: "get_state",
           subject_id: storedSubjectId ?? undefined,
           assessment_id: ASSESSMENT_ID,
         }),
       ]);
   
       setSchema(schemaResponse.schema);
       
       // Hydrate ALL state from server response
       const { assessment_state } = stateResponse;
       if (assessment_state) {
         setSubjectId(stateResponse.subject_id);
         setAssessmentId(stateResponse.assessment_id);
         setProfile(assessment_state.profile_data || {});
         setProfileAnswers(assessment_state.profile_answers || {});
         setAnswers(assessment_state.answers || {});
         setFlowPhase(assessment_state.flow_phase || "intro");
         
         // Store subject_id for session continuity
         if (stateResponse.subject_id) {
           localStorage.setItem(STORAGE_KEYS.subjectId, stateResponse.subject_id);
         }
       }
     } catch (err) {
       setFatalError(err instanceof Error ? err.message : "Unable to load.");
     } finally {
       setLoading(false);
     }
   }, []);
   ```

5. **Remove persistence useEffect hooks**:
   - Remove `useEffect` that saves `profile` to localStorage
   - Remove `useEffect` that saves `profileAnswers` to localStorage
   - Remove `useEffect` that saves `answers` to localStorage
   - Remove `useEffect` that saves `flowPhase` to localStorage

6. **Keep server writes on user actions** (these already exist):
   - `callAgent()` for profile updates
   - `callAgent()` for answer submissions

---

## Phase 3: Simplify useAssessmentState Hook

### Goal
Remove localStorage caching, always fetch from server.

### Changes to `src/hooks/useAssessmentState.ts`

1. **Remove STORAGE_KEYS** for `assessmentId` and `cachedState`

2. **Remove localStorage caching** in `fetchState()`:
   ```typescript
   // REMOVE these lines
   localStorage.setItem(STORAGE_KEYS.cachedState, JSON.stringify(serverState));
   
   // REMOVE fallback to cached state on error
   const cached = localStorage.getItem(STORAGE_KEYS.cachedState);
   ```

3. **Simplify error handling** - show error state instead of stale cache

4. **Update `startFresh()`** to only clear `subject_id` if needed:
   ```typescript
   const startFresh = useCallback(async () => {
     const subjectId = localStorage.getItem("rest-easy.readiness.subject_id");
     if (!subjectId) return;
   
     const response = await fetch(/* start_fresh endpoint */);
     const data = await response.json();
     
     // Update in-memory state with fresh assessment
     setState({
       serverState: data.assessment_state,
       syncStatus: "synced",
       lastSyncAt: new Date(),
       error: null,
     });
   }, []);
   ```

---

## Phase 4: Remove/Simplify useGuestProfile Hook

### Goal
This hook becomes unnecessary since all data comes from server.

### Options

**Option A: Remove entirely** and have Readiness.tsx manage profile state from server response.

**Option B: Simplify to read-only** - only used to display profile status on other pages.

### Recommended: Option A

The Readiness page will manage its own profile state hydrated from the server. Other pages (Dashboard) already use `useAssessmentState` which gets profile status from `assessment_state.profile_complete`.

---

## Phase 5: Update Results Page and AssessmentCTA

### Changes to `src/pages/Results.tsx`

Remove localStorage-based report loading:
```typescript
// BEFORE: Load from localStorage
const storedReport = localStorage.getItem(REPORT_STORAGE_KEY);

// AFTER: Fetch from server on mount
const { data: report, isLoading } = useQuery({
  queryKey: ["report", subjectId],
  queryFn: () => fetchReportFromServer(subjectId),
});
```

### Changes to `src/components/dashboard/AssessmentCTA.tsx`

Remove localStorage checks:
```typescript
// REMOVE these localStorage reads
const hasExistingReport = localStorage.getItem("rest-easy.readiness.report");
const isReportStale = localStorage.getItem("rest-easy.readiness.report_stale");

// Use server state instead
const hasReport = assessmentState.report_status === "ready";
```

---

## Phase 6: Clean Up Remaining localStorage References

### Files to check and update:
- Remove `profile-prompt-dismissed` from sessionStorage (low priority, UX helper)
- Remove any remaining `rest-easy.readiness.*` keys

---

## Data Flow After Refactor

```text
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER                                  │
├─────────────────────────────────────────────────────────────────┤
│  localStorage                                                   │
│  ┌─────────────────────────────────────┐                       │
│  │ rest-easy.readiness.subject_id      │ ← Only persistent key │
│  └─────────────────────────────────────┘                       │
│                                                                 │
│  React State (in-memory only)                                   │
│  ┌─────────────────────────────────────┐                       │
│  │ schema, profile, profileAnswers,    │                       │
│  │ answers, flowPhase, assessmentId    │                       │
│  └─────────────────────────────────────┘                       │
│            ↑ Hydrate on mount    │ Write on user action         │
└────────────┼─────────────────────┼──────────────────────────────┘
             │                     │
             │    get_state        │    save answer/profile
             │                     ↓
┌────────────┴─────────────────────────────────────────────────────┐
│                     EDGE FUNCTION (agent)                        │
├──────────────────────────────────────────────────────────────────┤
│  get_state → Returns full hydration payload:                     │
│    - subject_id, assessment_id                                   │
│    - profile_data, profile_answers                               │
│    - answers (all records)                                       │
│    - flow_phase (calculated)                                     │
│    - sections, scores, progress                                  │
│                                                                  │
│  save (default action) → Persists profile/answers to DB          │
│                                                                  │
│  start_fresh → Archives old, creates new assessment              │
└──────────────────────────────────────────────────────────────────┘
             │
             ↓
┌──────────────────────────────────────────────────────────────────┐
│                     SUPABASE DATABASE                            │
├──────────────────────────────────────────────────────────────────┤
│  readiness_v1.subjects          ← subject_id (session key)       │
│  readiness_v1.assessments       ← assessment records             │
│  readiness_v1.profile_intake    ← profile data                   │
│  readiness_v1.assessment_answers← all answers                    │
└──────────────────────────────────────────────────────────────────┘
```

---

## Implementation Order

1. **Edge Function First** - Expand `get_state` to return all needed data
2. **Readiness.tsx** - Refactor to server-fetch pattern
3. **useAssessmentState** - Remove caching
4. **useGuestProfile** - Remove or deprecate
5. **Results/AssessmentCTA** - Update to use server state
6. **Test thoroughly** - Especially "Start Fresh" flow

---

## Benefits

- **Single source of truth** - No sync issues between localStorage and server
- **Simpler debugging** - Check database, not localStorage
- **Auth-ready** - When auth is added, just pass `user_id` instead of `subject_id`
- **No stale data** - Fresh data on every page load
- **Cleaner code** - Remove ~50+ lines of localStorage management

## Tradeoffs

- **More network requests** - Every page load fetches from server (mitigated by server being fast)
- **No offline support** - Requires network (acceptable for this app)
- **Slightly slower initial load** - Must wait for server response before showing content

---

## Technical Notes

- The edge function already has the database queries needed; we just need to include the raw data in the response
- The `flow_phase` calculation can be done server-side based on profile/answer progress
- The schema is already fetched separately and can remain cached client-side if desired (it's static)
- Consider adding a loading skeleton that matches the final UI to improve perceived performance

