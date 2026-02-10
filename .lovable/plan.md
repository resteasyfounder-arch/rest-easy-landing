

## Remove "Skip for now" Button from Both Assessments

### What Changes

Remove the "Skip for now" button from the question screens in both the **Findability Assessment** (`Assessment.tsx`) and the **Life Readiness Assessment** (`Readiness.tsx`). As you noted, "Not sure" is already a valid answer option, making the skip button redundant.

### Technical Changes

**`src/pages/Assessment.tsx`**
1. Remove the `SkipButton` from the imports (line 11)
2. Delete the `handleSkip` function (lines 165-167)
3. Remove the `<SkipButton onClick={handleSkip} />` from the question screen UI (line 299), keeping the `<AutosaveIndicator>` in place

**`src/pages/Readiness.tsx`**
1. Remove `SkipButton` from the shared imports (line 14)
2. Delete the `handleSkip` function (lines 1065-1098)
3. Remove both `<SkipButton>` instances:
   - Line 1652 in the desktop/default question view
   - Line 1815 in the mobile question view
4. Keep the `<AutosaveIndicator>` components in place

### What Stays Unchanged

- The `SkipButton` component file itself (`src/components/assessment/shared/SkipButton.tsx`) remains in the codebase in case it is needed elsewhere in the future
- The "Skip for now" button in the Profile Prompt Modal (`ProfilePromptModal.tsx`) is unrelated and stays as-is
- The `handleSkipProfilePrompt` function in Readiness.tsx is unrelated (it skips the profile prompt, not questions) and stays

