

# Revised Plan: Restore Profile Editing with Dynamic Question Handling

## Summary

Restore the interactive profile editing functionality on the Profile page, with proper handling for when profile changes affect which assessment questions are applicable - both during an ongoing assessment and after completion.

## How Profile Changes Affect Questions

The assessment schema uses `applies_if` conditions to gate questions based on profile answers:

| Profile Answer | Questions Affected |
|----------------|-------------------|
| `has_pets = true` | Pet care planning questions (section 5) |
| `owns_crypto = true` | Cryptocurrency questions (section 6) |
| `has_spiritual_practices = true` | Spiritual/faith questions (section 8) |
| `supports_aging_parent = true` | Aging parent questions (section 9) |
| `owns_real_property = true` | Real property questions (section 10) |
| `has_significant_personal_property = true` | Personal property questions (section 10) |
| `has_beneficiary_accounts = true` | Beneficiary account questions (section 3) |

When a profile answer changes from "No" to "Yes", new questions become applicable that the user hasn't answered yet.

---

## Scenario Handling

### Scenario A: Profile Updated During Assessment (Not Yet Completed)

**Current Backend Behavior:**
- `applicableQuestions` list expands to include newly-gated questions
- `status` remains `in_progress` (was already incomplete)
- `overall_progress` percentage decreases (more questions in denominator)
- `current_question_id` may change to point to a new unanswered question

**Current Frontend Behavior:**
- Progress percentage updates automatically
- New sections appear in the sidebar
- User can navigate to new questions

**No additional changes needed** - the system already handles this correctly.

### Scenario B: Profile Updated After Assessment Completion

**Current Backend Behavior:**
- `applicableQuestions` list expands to include newly-gated questions
- `status` changes from `completed` back to `in_progress`
- `flow_phase` changes from `complete` to `assessment`
- `report_stale` is set to `true` if a report exists

**Current Frontend Behavior (Dashboard):**
- Dashboard shows `in_progress` status with new progress percentage
- "Continue Assessment" button appears instead of "View Report"
- User can click through to `/readiness` to answer new questions

**What's Missing:**
The Profile.tsx page needs to inform users when their change unlocks new questions.

---

## Implementation Steps

### Step 1: Update Type Definitions

Modify `src/types/assessment.ts` to include profile data:

```typescript
// Add to AssessmentState interface
profile_answers: Record<string, "yes" | "no">;
profile_data: Record<string, unknown>;
```

### Step 2: Update useAssessmentState Hook

Modify `src/hooks/useAssessmentState.ts`:
- Add `profile_answers: {}` and `profile_data: {}` to `createEmptyState()`
- The server already returns this data, we just need to expose it

### Step 3: Rewrite Profile.tsx with Interactive Editing

Transform the current read-only display into an interactive editor:

**Profile Item Mapping:**
```text
profile.household.has_dependents      -> "Family" (Users icon)
profile.pets.has_pets                 -> "Pets" (Heart icon)
profile.family.supports_aging_parent  -> "Caregiving" (HandHeart icon)
profile.home.owns_real_property       -> "Home" (Home icon)
profile.home.has_significant_...      -> "Belongings" (Briefcase icon)
profile.financial.has_beneficiary_... -> "Finances" (PiggyBank icon)
profile.digital.owns_crypto           -> "Digital" (Laptop icon)
profile.emotional.has_spiritual_...   -> "Faith" (Flower2 icon)
```

**Component Structure:**
1. Display each profile item as a clickable card showing current answer (Yes/No/Not set)
2. On click, open `ProfileEditModal` with the relevant question prompt
3. On save, call the agent endpoint with the updated profile
4. Refresh state to get updated section applicability

### Step 4: Add "New Questions Available" Notification

After a profile update, compare the new state with the previous state:

```typescript
const handleProfileUpdate = async (questionId: string, value: "yes" | "no") => {
  const previousProgress = assessmentState.overall_progress;
  const previousStatus = assessmentState.status;
  
  // Save the update
  await callAgent({
    subject_id: subjectId,
    assessment_id: ASSESSMENT_ID,
    profile: { profile_json: updatedProfile, version: SCHEMA_VERSION }
  });
  
  // Refresh state
  const newState = await refresh();
  
  // Detect if new questions were unlocked
  if (newState.overall_progress < previousProgress || 
      (previousStatus === "completed" && newState.status === "in_progress")) {
    // Show notification: "New questions are now available based on your update"
    toast({
      title: "New Questions Unlocked",
      description: "Your profile update has unlocked additional questions. Visit the assessment to answer them.",
      action: <Button onClick={() => navigate("/readiness")}>Go to Assessment</Button>
    });
  }
  
  // If report was marked stale, show different notification
  if (!wasStale && newState.report_stale) {
    toast({
      title: "Report Update Available",
      description: "Your report can be updated to reflect this change."
    });
  }
};
```

### Step 5: Show Assessment Status on Profile Page

Add a status indicator at the top of the Profile page:

```text
+--------------------------------------------------+
| Your Life Readiness Assessment                    |
|                                                   |
| Status: In Progress (75% complete)               |
| [Continue Assessment]  [View Dashboard]           |
+--------------------------------------------------+
```

This helps users understand that profile changes may affect their assessment state.

---

## Technical Details

### Files to Modify

| File | Changes |
|------|---------|
| `src/types/assessment.ts` | Add `profile_answers` and `profile_data` fields |
| `src/hooks/useAssessmentState.ts` | Include profile data in empty state |
| `src/pages/Profile.tsx` | Complete rewrite with interactivity and notifications |

### Files Used (No Changes)

- `src/components/profile/ProfileEditModal.tsx` - Already has modal functionality
- `supabase/functions/agent/index.ts` - Already returns profile data and handles stale reports

### API Contract

The agent endpoint already supports profile updates:

```json
{
  "action": "get_state",  // or implicit
  "subject_id": "uuid",
  "assessment_id": "readiness_v1",
  "profile": {
    "profile_json": {
      "household": { "has_dependents": true },
      "pets": { "has_pets": false },
      ...
    },
    "version": "v1"
  }
}
```

Response includes updated `status`, `overall_progress`, `sections`, and `report_stale`.

---

## Expected User Experience

### During Assessment (Not Yet Completed)
1. User visits `/profile` from sidebar or dashboard
2. Sees their current profile answers displayed as cards
3. Clicks "Pets" which shows "No"
4. Modal opens: "Do you have pets that are part of your family?"
5. User clicks "Yes"
6. Save occurs, toast appears: "New Questions Unlocked - Your profile update has unlocked additional questions about pet care planning."
7. Progress bar in header updates (was 85%, now 78%)
8. User clicks "Go to Assessment" or continues editing profile

### After Completion
1. User's assessment was 100% complete with a report generated
2. User visits `/profile` and changes "Owns Crypto" from No to Yes
3. Save occurs, toast appears: "New Questions Unlocked - 2 new questions about cryptocurrency are now available."
4. Dashboard now shows "Continue Assessment (95% complete)" instead of "View Report"
5. After answering the new questions, report auto-regenerates

---

## Edge Cases Handled

| Scenario | Behavior |
|----------|----------|
| Change Yes to No (removes questions) | Previously answered questions remain in database but become non-applicable; progress may increase; status may change to "completed" |
| Change unlocks 0 questions | Normal save, no "new questions" toast |
| Change only affects report (not questions) | Report marked stale, appropriate notification shown |
| Rapid multiple changes | Each save is independent; state is always recalculated from server |
| Offline/error during save | Error toast with retry option |

