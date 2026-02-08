

## Cache Findability Results, Remove "Mission" Language, and Strengthen Sign-Up CTAs

### Overview
Three changes: (1) cache the completed assessment in `sessionStorage` so users can navigate away and return to their results without retaking, (2) remove all "mission" / "rescue mission" terminology, and (3) enhance the results page with stronger sign-up messaging.

### 1. Session Caching for Assessment Results

**Problem:** When a guest completes the assessment, navigates home, and clicks "Take Assessment" again, all state is lost and they start over.

**Solution:** Use `sessionStorage` (persists for the browser tab/session, clears when they close the tab) to cache the completed results. On mount, check for cached results and skip straight to the results screen.

**Edit `src/pages/Assessment.tsx`:**
- On mount (or in the intro step), check `sessionStorage` for a key like `rest-easy.findability-results`
- If found, parse it and restore `answers`, `aiSummary`, `score`, and set `step` to `"results"` immediately
- After the AI summary is generated, save the full results payload (`answers`, `aiSummary`, `score`) to `sessionStorage`
- On "Retake Assessment", clear the `sessionStorage` key so they get a fresh start
- Also save in-progress answers to `sessionStorage` as the user answers questions, so if they navigate away mid-assessment they resume where they left off

**Cache structure:**
```
sessionStorage key: "rest-easy.findability-results"
value: JSON { answers, aiSummary, score, completedAt }

sessionStorage key: "rest-easy.findability-progress"  
value: JSON { answers, currentQuestionIndex }
```

### 2. Remove All "Mission" / "Rescue Mission" Language

Replace "mission" terminology with "action plan" or "next steps" language throughout.

**Edit `src/data/findabilityQuestions.ts`:**
- Rename the `RescueMission` interface to `ActionPlan`
- Rename the `rescueMission` property on each question to `actionPlan`
- Keep all titles and steps content the same (they don't say "mission" in the actual text)

**Rename and edit `src/components/assessment/results/RescueMissionPreview.tsx` to `ActionPlanPreview.tsx`:**
- Rename component from `RescueMissionPreview` to `ActionPlanPreview`
- Change "Your first mission" text to "Your first priority"
- Change "+4 more steps in your full mission" to "+4 more steps when you sign up"
- Update all internal variable names

**Edit `src/components/assessment/results/ResultsTrustSection.tsx`:**
- Change "~15 min per mission" to "~15 min to get started"
- Remove the unused `stats` array referencing "rescue mission"

**Edit `src/components/assessment/FindabilityResults.tsx`:**
- Update import from `RescueMissionPreview` to `ActionPlanPreview`

### 3. Strengthen the Results Page Sign-Up Messaging

**Edit `src/components/assessment/results/ResultsCTA.tsx`:**
- Add a stronger narrative section above the value props explaining what the full assessment covers
- Add specific outcomes: "Personalized action plan", "Step-by-step guidance from Remy", "Secure document vault for your family"
- Add social proof line: "Join thousands of people getting prepared"
- Make the primary button more prominent with a gradient or stronger visual treatment

**Edit `src/components/assessment/results/LifeReadinessTeaser.tsx`:**
- Expand the category list to show all 5 categories (not just 2 + "3 more")
- Add a brief one-liner under each category explaining what it covers
- Add a mini CTA button at the bottom: "See Your Full Score" linking to sign-up

**Edit `src/components/assessment/results/ActionPlanPreview.tsx` (renamed):**
- Add a sign-up nudge at the bottom of the locked steps: "Create a free account to unlock your full action plan"

### Files Changed

- **Edit:** `src/pages/Assessment.tsx` -- add sessionStorage caching for completed results and in-progress answers
- **Edit:** `src/data/findabilityQuestions.ts` -- rename `RescueMission` to `ActionPlan`, `rescueMission` to `actionPlan`
- **Rename + Edit:** `src/components/assessment/results/RescueMissionPreview.tsx` to `ActionPlanPreview.tsx` -- remove mission language, add sign-up nudge
- **Edit:** `src/components/assessment/results/ResultsTrustSection.tsx` -- remove mission references
- **Edit:** `src/components/assessment/FindabilityResults.tsx` -- update imports, use ActionPlanPreview
- **Edit:** `src/components/assessment/results/ResultsCTA.tsx` -- stronger sign-up messaging with more detail
- **Edit:** `src/components/assessment/results/LifeReadinessTeaser.tsx` -- expand categories, add mini CTA

