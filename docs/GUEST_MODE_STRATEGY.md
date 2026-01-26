# Guest Mode Strategy

## Overview

This document outlines the guest mode implementation strategy for the Rest Easy assessment flow, enabling rapid development and testing before authentication is enabled.

---

## Current State: Guest Mode (Pre-Auth) with Server-Authoritative State

### How It Works

1. **No login required** - Users can complete the entire assessment flow without creating an account
2. **Anon key access** - The UI uses the Supabase anon key to call edge functions
3. **Guest subjects** - The edge function creates a guest subject (`subjects.kind = "guest"`) and a draft assessment
4. **Session ID only in localStorage** - Only `rest-easy.readiness.subject_id` is stored locally to identify the session
5. **Server is source of truth** - All assessment state (profile, answers, progress) is fetched from the backend on each page load

### Key Files

| File | Purpose |
|------|---------|
| `supabase/functions/agent/index.ts` | Creates guest subjects, returns full assessment state via `get_state` |
| `src/pages/Readiness.tsx` | Main assessment flow, hydrates state from server |
| `src/hooks/useAssessmentState.ts` | Fetches assessment state for Dashboard display |

### Data Flow

```
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

### Why Server-Authoritative

1. **Single source of truth** - No sync issues between localStorage and server
2. **Simpler debugging** - Check database, not localStorage
3. **Auth-ready** - When auth is added, just pass `user_id` instead of `subject_id`
4. **No stale data** - Fresh data on every page load
5. **Cleaner code** - No localStorage management logic

---

## Future State: Authenticated Mode

### When Auth Is Enabled

Once login is implemented, guest mode will be **removed** and all actions require an authenticated user.

### Required Changes

#### 1. Edge Function Auth Enforcement

```typescript
// Remove guest subject creation
// Enforce JWT verification
// Pull user_id from JWT claims
const { data: claims, error } = await supabase.auth.getClaims(token);
const userId = claims.sub;
```

#### 2. RLS Policies

- Lock down all `readiness_v1` tables
- Rows only accessible by `auth.uid()`
- Every assessment, answer, and profile row links to authenticated user

```sql
CREATE POLICY "Users can only access their own assessments"
ON public.assessments FOR ALL
USING (auth.uid() = user_id);
```

#### 3. Client Behavior Changes

| Current (Guest) | Future (Auth) |
|-----------------|---------------|
| subject_id in localStorage | Session managed by Supabase Auth |
| No login required | Must login before any actions |
| Guest subject created | Subject tied to user_id |

---

## Testing Implications

### During Guest Mode (Now)

- AI can test full flow without authentication
- Changes to flow, UI, scoring can be validated immediately
- Edge function logs show guest subject operations
- Database queries show real data for debugging

### After Auth Enabled

- AI testing becomes more complex (requires authenticated session)
- May need test user accounts or service role access for validation
- Consider keeping a "demo mode" or test endpoints if needed

---

## Related Documentation

- Profile-to-section filtering: See `applicableSections` in `Readiness.tsx`
- Schema structure: See `supabase/seed/readiness_v1_schema.json`
- Edge function API: See `supabase/functions/agent/index.ts`
