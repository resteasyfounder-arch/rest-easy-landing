
# Life Readiness Assessment Flow Issues

## Issues Identified

### Issue 1: Checkbox Movement Animation Bug
**Symptom**: After clicking an answer, the checkbox appears to "move" within the answer box.

**Root Cause**: The `AnswerButton` component in `src/components/assessment/shared/AnswerButton.tsx` applies an `animate-selection-confirm` class when selected. This animation (defined in `src/index.css` lines 436-450) pulses the background color. However, the issue is that the checkbox itself has a conditional `animate-check-pop` animation that only triggers when `showConfirmation` is true.

The visual "movement" happens because:
1. When an answer is clicked, `recentlySelected` is set, which triggers `showConfirmation={true}` 
2. The `animate-check-pop` animation runs (scales up then down)
3. The button also has a `hover:-translate-y-0.5` class causing the whole button to shift
4. Combined with the `active:scale-[0.98] active:translate-y-0` on click, this creates a jittery feel

**Solution**: 
- Remove the conflicting transform animations that cause visual jitter
- Make the checkbox position stable by ensuring animations don't affect layout

### Issue 2: Dynamic Question Count Increasing
**Symptom**: Started with "0 of 10" and increased to "9 of 17" as questions were answered.

**Root Cause**: This is actually **intentional behavior** based on the assessment schema design. The `applicableQuestions` list is calculated dynamically based on both profile answers AND assessment answers:

```typescript
const applicableQuestions = useMemo(() => {
  if (!schema) return [];
  return schema.questions.filter((question) =>
    evaluateCondition(question.applies_if, profile, answerValues)
  );
}, [schema, profile, answerValues]);
```

The schema uses `applies_if` conditions like:
- `"applies_if": "answers['1.1.A.1'] in ['yes','partial']"` - shows follow-up questions only if the user answered "yes" or "partial" to a previous question
- `"applies_if": "answers['1.1.B.1'] in ['yes','partial'] or answers['1.1.B.3'] in ['yes','partial']"` - branching logic

This means when you answer "yes" to "Do you have a will?", follow-up questions like "Is your will up to date?" become applicable and add to the total.

**UX Problem**: While technically correct, showing the total count changing (e.g., "0 of 10" → "9 of 17") is confusing and anxiety-inducing for users. They feel like the assessment is "growing" rather than making progress.

**Solution**: Change the progress display from showing total applicable questions to showing **section-based** progress only. Users will see "3 of 8 in this section" instead of "9 of 17 total", which remains stable within each section.

---

## Technical Implementation Plan

### Fix 1: Checkbox Animation Stability

**File: `src/components/assessment/shared/AnswerButton.tsx`**

1. Remove the conflicting hover transform that causes visual jitter:
   - Remove `hover:-translate-y-0.5` from the button className
   - Keep the `active:scale-[0.98]` but remove `active:translate-y-0`

2. Simplify the selection visual feedback:
   - The `animate-selection-confirm` background pulse is fine
   - Keep `animate-check-pop` for the checkmark appearance but ensure it doesn't affect surrounding elements

3. Make the checkbox container use `transform-origin: center` to prevent layout shift during animation

### Fix 2: Stable Progress Display

**File: `src/pages/Readiness.tsx`**

1. **Change header display from total questions to section questions**:
   - Currently shows: `Question {currentQuestionIndex} of {applicableQuestions.length}`
   - Change to: `Question {currentSectionQuestionIndex} of {currentSectionQuestionCount}`

2. **Add new computed values** for section-specific progress:
   ```typescript
   const currentSectionQuestionIndex = useMemo(() => {
     if (!currentQuestion || !currentSection) return 0;
     const sectionQuestions = applicableQuestions.filter(q => q.section_id === currentSection.id);
     return sectionQuestions.findIndex(q => q.id === currentQuestion.id) + 1;
   }, [currentQuestion, currentSection, applicableQuestions]);

   const currentSectionQuestionCount = useMemo(() => {
     if (!currentSection) return 0;
     return applicableQuestions.filter(q => q.section_id === currentSection.id).length;
   }, [currentSection, applicableQuestions]);
   ```

3. **Update the header displays** in both desktop and mobile views to use section-based counts

4. **Keep existing sidebar progress** (which already uses `sectionProgress[section.id]`) - this correctly shows per-section progress

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/assessment/shared/AnswerButton.tsx` | Remove conflicting transform animations, stabilize checkbox positioning |
| `src/pages/Readiness.tsx` | Add section-specific question counting, update header display to show section progress |
| `src/index.css` | (Optional) Minor animation timing adjustments if needed |

---

## Expected Behavior After Fix

### Checkbox Animation
- Clicking an answer shows smooth selection feedback
- Checkmark appears with a subtle pop animation
- No jittery movement or layout shift

### Progress Display  
- Header shows "Question 3 of 8" (within current section) instead of "Question 9 of 17" (total)
- Section name is clearly displayed above the count
- Sidebar continues showing per-section progress bars correctly
- Total count within a section may still grow slightly (e.g., 8 → 10) if follow-up questions unlock, but this is much less jarring than the global count changing dramatically
