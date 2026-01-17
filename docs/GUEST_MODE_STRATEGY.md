# Guest Mode Strategy

## Overview

This document outlines the guest mode implementation strategy for the Rest Easy assessment flow, enabling rapid development and testing before authentication is enabled.

---

## Current State: Guest Mode (Pre-Auth)

### How It Works

1. **No login required** - Users can complete the entire assessment flow without creating an account
2. **Anon key access** - The UI uses the Supabase anon key to call edge functions
3. **Guest subjects** - The edge function creates a guest subject (`subjects.kind = "guest"`) and a draft assessment
4. **Local persistence** - Browser stores state in localStorage:
   - `rest-easy.readiness.subject_id`
   - `rest-easy.readiness.assessment_id`
   - `rest-easy.readiness.profile_json`
   - `rest-easy.readiness.profile_answers`
5. **Backend sync** - Answers and profile are still sent to the backend, tied to the guest subject (no user identity)

### Key Files

| File | Purpose |
|------|---------|
| `src/hooks/useGuestProfile.ts` | Manages guest profile state, localStorage sync, and backend calls |
| `supabase/functions/agent/index.ts` | Creates guest subjects, handles upsert operations |
| `src/pages/Readiness.tsx` | Main assessment flow, uses guest profile hook |

### Why Guest Mode Exists

1. **Unblocked development** - Test entire flow without auth complexity
2. **Rapid iteration** - No login barriers during testing
3. **Full validation** - Still validates:
   - Schema loading and parsing
   - Profile-based question gating (`applies_if` logic)
   - Section filtering (applicable sections only)
   - Answer persistence
   - Scoring logic
   - Navigation flow

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
| localStorage is system of record | localStorage is cache only |
| No session token required | Valid session token required |
| Guest subject created | Subject tied to user_id |
| Can access without login | Must login before any actions |

---

## Testing Implications

### During Guest Mode (Now)

- AI can test full flow without authentication
- Changes to flow, UI, scoring can be validated immediately
- Edge function logs show guest subject operations

### After Auth Enabled

- AI testing becomes more complex (requires authenticated session)
- May need test user accounts or service role access for validation
- Consider keeping a "demo mode" or test endpoints if needed

---

## Migration Considerations

When transitioning from guest to authenticated mode:

1. **Existing guest data** - Decide whether to:
   - Discard all guest subjects/assessments
   - Offer a "claim your assessment" flow for returning users
   - Keep guest data for analytics but mark as non-user

2. **localStorage cleanup** - Clear guest storage keys on login

3. **UI flow changes** - Add login gate before assessment start

---

## Related Documentation

- Profile-to-section filtering: See `applicableSections` in `Readiness.tsx`
- Schema structure: See `supabase/seed/readiness_v1_schema.json`
- Edge function API: See `supabase/functions/agent/index.ts`
