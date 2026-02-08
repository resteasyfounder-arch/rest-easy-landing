

## Fix: Stable Section Question Count

### Problem
When you start the "Legal Planning & Decision Makers" section, it shows "0 of 10 questions." After answering the first question (e.g., "Do you have a will?") with "Yes," a follow-up question becomes applicable (e.g., "Is your will up to date?"), causing the count to jump to "1 of 11." This happens because the question count is recalculated every time an answer changes, since some questions have answer-dependent visibility (`applies_if` conditions that reference other answers).

### Solution
Snapshot the section question count when the user enters a section, so the denominator stays fixed while they work through it. If answering a question unlocks new follow-up questions, the total will only update the next time the user enters that section (or navigates away and back).

### Technical Changes

**`src/pages/Readiness.tsx`**

1. **Add a new state variable** `sectionQuestionSnapshot` (type `Record<string, number>`) to store the snapshotted question count per section.

2. **Snapshot on section entry**: When `focusedSectionId` or `currentSection` changes to a new section, capture the current count of applicable questions for that section and store it in the snapshot map.

3. **Use the snapshot for display**: Change `currentSectionQuestionCount` to read from the snapshot instead of recalculating from the live `applicableQuestions` list. Fall back to the live count if no snapshot exists.

4. **Clear snapshot on section exit**: When the user leaves a section (navigates to a different section or exits to the journey view), remove that section's entry from the snapshot so the next entry gets a fresh count.

This ensures the "Question X of Y" label stays stable within a section while still being accurate when you first enter it.

