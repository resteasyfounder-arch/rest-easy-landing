

## Strategic Path Forward: Preparing for Auth with Single Assessment Per User

### Current State Analysis

Based on my investigation, here's what's happening:

**Database State for your subject (`2254491d-7086-47ae-a2db-ea2fe3ff80f6`):**
- **8 assessments** exist for the same subject_id
- Only **1 assessment** (from Jan 15) has actual answers (57 answers, score 63)
- **7 other assessments** have 0 answers but are marked as "completed" with score 63
- The edge function picks the one with answers (the old completed one)

**Profile Data in Database:**
```json
{
  "digital": {"owns_crypto": false},
  "emotional": {"has_spiritual_practices": true},
  "family": {"supports_aging_parent": false},
  // ... nested structure
  "profile.digital.owns_crypto": "yes",  // Also has flat keys!
  "profile.home.owns_real_property": "no"
}
```

**Profile Data in localStorage (via useGuestProfile):**
- Uses flat keys like `profile.household.has_dependents`
- Counts 8 keys = complete

**The Mismatch:**
- Server profile uses NESTED structure (`digital.owns_crypto`)
- Client/localStorage uses FLAT structure (`profile.digital.owns_crypto`)
- The edge function checks schema profile_questions which use FIELD names that don't match either format

---

### Best Path Forward: Three-Phase Approach

Given that auth will be enabled with 1 assessment per user, here's the recommended strategy:

---

## Phase 1: Immediate Fixes (Do Now)

### 1.1 Add Missing Database Columns
The `report_status` and `report_url` columns are missing from the assessments table, causing silent errors.

```sql
ALTER TABLE readiness_v1.assessments 
ADD COLUMN IF NOT EXISTS report_status text DEFAULT 'not_started',
ADD COLUMN IF NOT EXISTS report_url text;
```

### 1.2 Add "Start Fresh" Capability
Since multiple assessments exist per subject, add a way for users to explicitly start a new assessment:

**Changes Required:**
- Add "Start Fresh Assessment" button to Dashboard (when old data is detected)
- Create new edge function action `start_fresh` that:
  - Archives or soft-deletes old assessments for the subject
  - Creates a new blank assessment
  - Clears the assessment_answers for old assessments

### 1.3 Unify Profile Field Format
Standardize on ONE format for profile fields. The schema uses field names like `owns_crypto`, but the client sends `profile.digital.owns_crypto`.

**Recommendation:** 
- Keep the flat `profile.xxx.yyy` format in localStorage (matches current UI)
- Update the edge function's profile completion calculation to check BOTH nested and flat keys
- OR update the schema profile_questions to use flat field names

---

## Phase 2: Prepare for Auth (Before Enabling)

### 2.1 Update Edge Function Assessment Selection
Change the logic to support "one assessment per user" paradigm:

```typescript
// Current: picks assessment with most answers (problematic)
// Future: when auth is enabled, each user_id maps to exactly one assessment

// Transition approach:
// 1. If user_id is provided (authenticated), use that as the lookup key
// 2. If only subject_id (guest mode), use most recent assessment
```

### 2.2 Add `user_id` Column to Subjects Table
Prepare the database for authenticated users:

```sql
ALTER TABLE readiness_v1.subjects 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_subjects_user_id 
ON readiness_v1.subjects(user_id);
```

### 2.3 Update Assessment State Hook
Modify `useAssessmentState` to:
- Accept optional `userId` parameter
- Pass `user_id` to edge function when authenticated
- Clear localStorage on logout

---

## Phase 3: Auth Migration (When Enabling)

### 3.1 Guest to User Migration Flow
When a guest user signs up/logs in:
1. Check if they have a `subject_id` in localStorage
2. Link that subject to their `user_id` 
3. Clear guest localStorage keys
4. Prevent creating new subjects for authenticated users

### 3.2 Enforce One Assessment Per User
Add database constraint (optional but recommended):

```sql
-- After migration, enforce uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS idx_assessments_user_subject 
ON readiness_v1.assessments(subject_id, assessment_id);
```

### 3.3 RLS Policies
Enable Row Level Security tied to `auth.uid()`:

```sql
-- Users can only see their own data
CREATE POLICY "Users can access own assessments"
ON readiness_v1.assessments FOR ALL
USING (subject_id IN (
  SELECT id FROM readiness_v1.subjects WHERE user_id = auth.uid()
));
```

---

## Recommended Immediate Action

For the issues you're experiencing RIGHT NOW, I recommend:

1. **Add missing database columns** - Fixes silent errors
2. **Add "Start Fresh" button** - Lets you clear old data and truly start over
3. **Fix profile field format** - Aligns server and client profile completion logic

### Files to Modify

| File | Change |
|------|--------|
| Database migration | Add `report_status`, `report_url` columns |
| `supabase/functions/agent/index.ts` | Add `start_fresh` action, fix profile field checking |
| `src/pages/Dashboard.tsx` | Add "Start Fresh" button when stale data detected |
| `src/hooks/useGuestProfile.ts` | Add `clearAll()` method that clears subject_id too |

---

## Summary

**Short-term (fix current issues):**
- Add missing DB columns
- Add "Start Fresh" capability  
- Fix profile field format mismatch

**Medium-term (prepare for auth):**
- Add `user_id` column to subjects
- Update edge function to support user_id lookup
- Design guest-to-user migration flow

**Long-term (enable auth):**
- Implement auth with migration
- Add RLS policies
- Enforce one assessment per user constraint

This approach lets you continue developing and testing NOW while building toward the authenticated single-assessment model.

