
# Enforce One Assessment Per Subject + Data Cleanup

## Problem Summary

The current implementation allows multiple assessments per subject, causing:
1. Report saves to assessment A, but Results page fetches from assessment B
2. The "preparing your report" loop because the frontend gets confused about which assessment is active
3. 11 assessments for a single subject in the database

## Root Causes

### 1. `ensureAssessment()` Creates Duplicates
The function at lines 961-998 in `agent/index.ts` only looks for assessments with `status: "draft"`:

```typescript
const { data: existing } = await readiness
  .from("assessments")
  .select("id")
  .eq("subject_id", subjectId)
  .eq("assessment_id", assessmentKey)
  .eq("status", "draft")  // <-- Problem: ignores completed assessments
  .order("created_at", { ascending: false })
  .limit(1)
  .maybeSingle();
```

When a user completes an assessment, this query returns nothing, so a new draft assessment is created.

### 2. Inconsistent Assessment Selection
- `get_state` prefers assessments with answers (loops through all, picks first with count > 0)
- `get_report` just picks the most recent by `created_at`
- These can return different assessment IDs

### 3. No Database Constraint
There's no unique constraint preventing multiple active assessments per subject.

---

## Solution

### Phase 1: Clean Up Your Session Data

Delete your current session from the database so you can test fresh:

```sql
-- Delete all data for subject_id: 2fb89914-05ae-471c-975c-aa7d9d31ae86
DELETE FROM readiness_v1.assessment_answers 
WHERE subject_id = '2fb89914-05ae-471c-975c-aa7d9d31ae86';

DELETE FROM readiness_v1.assessments 
WHERE subject_id = '2fb89914-05ae-471c-975c-aa7d9d31ae86';

DELETE FROM readiness_v1.profile_intake 
WHERE subject_id = '2fb89914-05ae-471c-975c-aa7d9d31ae86';

DELETE FROM readiness_v1.subjects 
WHERE id = '2fb89914-05ae-471c-975c-aa7d9d31ae86';
```

After this runs, you'll also clear localStorage in DevTools:
- Application > Local Storage > Delete `rest-easy.readiness.subject_id`

### Phase 2: Add Unique Constraint at Database Level

Create a migration to enforce one assessment per subject:

```sql
-- First, clean up duplicate assessments (keep the one with most answers)
-- This is a data cleanup step

-- Add unique constraint (with assessment_id for future multi-assessment support)
-- We use a partial unique index to allow archived assessments
CREATE UNIQUE INDEX IF NOT EXISTS assessments_one_active_per_subject 
ON readiness_v1.assessments (subject_id, assessment_id) 
WHERE status != 'archived';
```

This constraint:
- Prevents inserting a second non-archived assessment for the same subject
- Allows "archived" assessments for historical purposes (if you ever implement `start_fresh`)
- Works with both guest mode and future authenticated mode

### Phase 3: Refactor `ensureAssessment()` 

Update to find ANY existing assessment, not just drafts:

```typescript
async function ensureAssessment(
  readiness: ReturnType<ReturnType<typeof createClient>["schema"]>,
  subjectId: string,
  assessmentId?: string
): Promise<{ id?: string; error?: string }> {
  const assessmentKey = assessmentId ?? "readiness_v1";

  // Find ANY existing non-archived assessment for this subject
  const { data: existing } = await readiness
    .from("assessments")
    .select("id")
    .eq("subject_id", subjectId)
    .eq("assessment_id", assessmentKey)
    .neq("status", "archived")  // Exclude archived only
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing?.id) {
    return { id: existing.id };
  }

  // Create new only if none exists
  const { data: created, error } = await readiness
    .from("assessments")
    .insert({
      subject_id: subjectId,
      assessment_id: assessmentKey,
      schema_version: "v1",
      status: "draft",
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  return { id: created.id };
}
```

### Phase 4: Unify Assessment Selection in `get_state` and `get_report`

Create a shared helper function:

```typescript
async function findActiveAssessment(
  readiness: ReturnType<ReturnType<typeof createClient>["schema"]>,
  subjectId: string,
  assessmentKey: string
): Promise<{ id: string; status: string; report_status: string; report_data: unknown } | null> {
  // With the unique constraint, there's only ONE non-archived assessment
  const { data } = await readiness
    .from("assessments")
    .select("id, status, report_status, report_data, report_generated_at")
    .eq("subject_id", subjectId)
    .eq("assessment_id", assessmentKey)
    .neq("status", "archived")
    .maybeSingle();  // Safe because of unique constraint

  return data;
}
```

Then refactor both `get_state` and `get_report` to use this helper.

### Phase 5: Update Assessment Status Constraint

Add `in_progress` and `archived` to the valid status values:

```sql
-- Allow more status values
ALTER TABLE readiness_v1.assessments 
DROP CONSTRAINT IF EXISTS assessments_status_check;

ALTER TABLE readiness_v1.assessments 
ADD CONSTRAINT assessments_status_check 
CHECK (status IN ('draft', 'in_progress', 'completed', 'archived'));
```

---

## Data Flow After Changes

```text
NEW USER                              RETURNING USER
    │                                        │
    ▼                                        ▼
┌──────────────────┐               ┌──────────────────────┐
│ ensureSubject()  │               │ ensureSubject()      │
│ Creates guest    │               │ Returns existing     │
└──────────────────┘               └──────────────────────┘
    │                                        │
    ▼                                        ▼
┌──────────────────┐               ┌──────────────────────┐
│ ensureAssessment │               │ ensureAssessment     │
│ Creates ONE      │               │ Returns THE SAME     │
│ assessment       │               │ assessment (always)  │
└──────────────────┘               └──────────────────────┘
    │                                        │
    ▼                                        ▼
┌──────────────────────────────────────────────────────────┐
│         UNIQUE CONSTRAINT GUARANTEES:                     │
│         ONE subject_id = ONE assessment_id                │
│         (except archived)                                 │
└──────────────────────────────────────────────────────────┘
```

---

## Files to Modify

| File | Changes |
|------|---------|
| Database migration | Add unique index, update status constraint, clean up duplicates |
| `supabase/functions/agent/index.ts` | Refactor `ensureAssessment`, add `findActiveAssessment` helper, update `get_state` and `get_report` to use it |

---

## Future Auth Compatibility

This approach works seamlessly when authentication is enabled:

**Guest Mode (now):**
- `subject.kind = "guest"`, no `user_id`
- Unique constraint prevents duplicate assessments per guest subject

**Authenticated Mode (future):**
- `subject.kind = "user"`, `user_id = auth.uid()`
- Existing unique index on `subjects.user_id` ensures one subject per user
- Combined with assessment unique constraint = one assessment per user

No additional changes needed when auth is enabled.

---

## Testing Plan

After implementation:

1. Clear browser localStorage
2. Navigate to `/readiness`
3. Complete profile questions
4. Answer several assessment questions
5. Complete all questions - verify auto-report triggers
6. Verify redirect to `/results` shows report
7. Navigate to Dashboard, click "View Report" - verify it works
8. Edit an answer - verify report shows "Update Available"
9. Complete again - verify report regenerates

---

## Summary

This plan:
- Cleans up your existing session data for fresh testing
- Adds database-level enforcement of one assessment per subject
- Fixes the root cause of the "preparing report" loop
- Ensures consistent assessment selection across all edge function actions
- Works for guest mode now and authenticated mode in the future
