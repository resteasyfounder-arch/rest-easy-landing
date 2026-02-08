

## Overhaul Findability Assessment Flow

### Overview
Streamline the free Findability Assessment into a seamless, uninterrupted experience. Remove mid-assessment pause screens and section transitions that break flow. After the final question, show a brief "generating" moment while Remy (AI) summarizes the user's answers, then display a polished results page with the AI summary and a clear sign-up prompt.

### Current Problems
1. **Pause screens** (`pauseAfter` flag) interrupt the flow with a full-screen message and progress bar between questions 3-4 and 6-7. Users must wait ~3.5 seconds or tap to continue.
2. **Section transitions** (`sectionEnd` flag) show another full-screen interstitial between sections (after questions 4, 6, and 8). Each requires a manual "Continue" tap.
3. **Results are purely template-based** -- the score, breakdown, and rescue mission are all calculated from static data. No AI personalization.
4. **The completion screen** is a generic "Thank you" page that routes to `/results`, but `/results` is the full Life Readiness report page (for logged-in users). Free users see a "Complete the Life Readiness assessment" empty state.
5. **Sign-up prompt** is just a "Start My First Rescue Mission" button linking to `/login` -- no narrative connection to the value of signing up.

### Proposed Flow

```text
[Intro] --> [Q1] --> [Q2] --> ... --> [Q8] --> [Generating...] --> [Findability Results + Sign-up CTA]
```

No pauses. No section transitions. Just questions flowing one after another, then a brief AI generation moment, then results.

### Changes

**1. Remove pause and section transition interruptions**

Edit `src/pages/Assessment.tsx`:
- Remove the `"pause"` and `"section-transition"` steps from the `Step` type
- Simplify `advanceToNext()` to always go to the next question (no `pauseAfter` or `sectionEnd` checks)
- Remove `handlePauseContinue`, `handleSectionContinue`, and related rendering blocks
- After the last question, transition directly to a new `"generating"` step

**2. Add AI-powered summary generation step**

Create a new edge function `supabase/functions/generate-findability-summary/index.ts`:
- Receives the 8 question-answer pairs + calculated score
- Uses the Lovable AI Gateway (LOVABLE_API_KEY) to generate a personalized 3-4 sentence summary from Remy's perspective
- Returns: `{ summary: string, top_priority: string, encouragement: string }`
- The summary addresses the user's specific gaps and strengths in a warm, Remy-like voice

New step in `Assessment.tsx` -- `"generating"`:
- Shows a calm loading screen with Remy's avatar and a message like "Remy is reviewing your answers..."
- Calls the edge function
- On success, transitions to `"results"` with the AI summary in state

**3. Redesign the results display (inline, not navigating away)**

Instead of navigating to `/results` (which is the full Life Readiness report page), show results inline within the Assessment page.

Edit `src/pages/Assessment.tsx` -- the `"results"` step:
- Replace the current `CompletionScreen` with the `FindabilityResults` component, enhanced with the AI summary
- Pass the AI summary as a new prop

Edit `src/components/assessment/FindabilityResults.tsx`:
- Add a new `RemySummaryCard` section at the top (after the score hero), showing Remy's personalized AI summary with the Remy avatar
- This replaces the generic breakdown as the hero content

**4. Redesign the sign-up CTA**

Edit `src/components/assessment/results/ResultsCTA.tsx`:
- Change primary CTA from "Start My First Rescue Mission" to something like "Create Your Free Account" or "Unlock Your Full Life Readiness Score"
- Add a brief value proposition above the button: what signing up unlocks (full assessment, Remy guidance, EasyVault)
- Keep "Retake" as a secondary action
- Remove "Save & Exit" (results are already in localStorage)

Edit `src/components/assessment/results/LifeReadinessTeaser.tsx`:
- Strengthen the teaser copy to better connect Findability as "step 1" and the full assessment + EasyVault as the natural next steps
- Add mention of Remy as the ongoing AI guide

### Technical Details

**New edge function: `supabase/functions/generate-findability-summary/index.ts`**
- Uses `LOVABLE_API_KEY` with the Lovable AI Gateway (`https://ai.gateway.lovable.dev/v1/chat/completions`)
- Model: `google/gemini-3-flash-preview` (default)
- System prompt positions Remy as a warm, knowledgeable guide summarizing what the user's findability answers reveal
- Non-streaming (simple request/response via `supabase.functions.invoke`)
- Handles 429/402 errors gracefully

**`src/pages/Assessment.tsx` changes:**
- Step type becomes: `"intro" | "questions" | "generating" | "results"`
- New state: `aiSummary: { summary: string; top_priority: string; encouragement: string } | null`
- `advanceToNext()` simplified: always increments question index, or moves to `"generating"` on last question
- New `"generating"` step renders a loading screen and calls the edge function
- `"results"` step renders `FindabilityResults` inline with `aiSummary` passed down

**`src/components/assessment/FindabilityResults.tsx` changes:**
- New optional prop: `aiSummary?: { summary: string; top_priority: string; encouragement: string }`
- New `RemySummaryCard` component rendered between ScoreHero and RescueMissionPreview, showing the AI-generated summary with Remy's avatar image

**`src/data/findabilityQuestions.ts` cleanup:**
- Remove `pauseAfter` and `sectionEnd` flags from question objects (and from the `FindabilityQuestion` type)
- Remove `sectionInfo` export (no longer needed)
- Keep `reflectionText` -- the brief reflection moments between questions are subtle and don't break flow

**Files changed:**
- **New:** `supabase/functions/generate-findability-summary/index.ts` -- Remy AI summary edge function
- **Edit:** `src/pages/Assessment.tsx` -- remove pauses/transitions, add generating step, show results inline
- **Edit:** `src/components/assessment/FindabilityResults.tsx` -- add AI summary card, accept new prop
- **Edit:** `src/components/assessment/results/ResultsCTA.tsx` -- redesign sign-up prompt with value proposition
- **Edit:** `src/components/assessment/results/LifeReadinessTeaser.tsx` -- strengthen teaser copy
- **Edit:** `src/data/findabilityQuestions.ts` -- remove `pauseAfter`, `sectionEnd` flags and `sectionInfo`
- **Edit:** `supabase/config.toml` -- add the new edge function entry

