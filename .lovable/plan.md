
## Fix Blank Screen After Answer Update + Remy Build Errors

### Problem 1: Blank Screen After Updating an Answer

When Remy or the dashboard navigates you to a specific question (e.g., `/readiness?section=1&question=1.1.B.3&returnTo=vault`), answering that question causes a blank screen. Here is why:

1. The `handleAnswer` function only handles `returnTo === "dashboard"` (line 847). For `returnTo=vault` or other values, it falls through.
2. Since the assessment is already complete, answering the last question in the section sets `viewingCompletedSection = true`, which shows the "Section Complete" screen.
3. Clicking "Continue to Next Section" calls `handleContinueFromCompletedSection`, which finds no more unanswered questions and sets `flowPhase = "complete"`.
4. The `"complete"` flow phase has **no rendering** -- it just has a comment saying "fall through." It does not match `"assessment"` or `"review"`, so the component falls to the `LoadingSkeleton` fallback, which looks like a blank screen that never resolves.

**Fix**: Two changes in `src/pages/Readiness.tsx`:

- **Generalize the `returnTo` handling** (line 847): Instead of only handling `returnTo === "dashboard"`, handle any truthy `returnTo` value. Navigate to `/${returnTo}` (e.g., `/vault`, `/dashboard`, `/results`) after saving the answer. This gives users the expected "answer and return" flow.

- **Add a proper `"complete"` phase rendering**: When `flowPhase === "complete"` (and no pending navigation), render a completion card that offers navigation to the Results page or back to the Dashboard, instead of falling through to nothing. This prevents the blank screen even if `returnTo` is not set.

### Problem 2: Build Errors in Remy Edge Functions

These are pre-existing TypeScript errors in the `supabase/functions/remy/` directory:

**a) Missing `.ts` extensions in test file imports (5 errors)**

The test files use bare module imports (e.g., `from "./decisionEngine"`) but Deno requires explicit `.ts` extensions. Fix all 5 test files:
- `chatTurn.test.ts`: `"./chatTurn"` -> `"./chatTurn.ts"`
- `decisionEngine.test.ts`: `"./decisionEngine"` -> `"./decisionEngine.ts"`
- `providerUtils.test.ts`: `"./providerUtils"` -> `"./providerUtils.ts"`
- `remyPayloadBuilder.smoke.test.ts`: `"./remyPayloadBuilder"` -> `"./remyPayloadBuilder.ts"`
- `turnPlanner.test.ts`: `"./turnPlanner"` -> `"./turnPlanner.ts"`, `"./chatTurn"` -> `"./chatTurn.ts"`

**b) Implicit `any` types in `remy/index.ts` (3 errors)**

Lines 574 and 580 have `.map()` callbacks without type annotations on parameters. Add explicit types:
- Line 574: `.map((item: { role: string; message_text?: string; created_at?: string }) => ...)`
- Line 580: `.map(({ role, text }: { role: string; text: string }) => ...)`

**c) `question_id` does not exist on `SchemaQuestion` (1 error)**

In `remyPayloadBuilder.ts` line 175, `nextUnanswered.question_id` is used but `SchemaQuestion` only has `id`. Change to `nextUnanswered.id`.

**d) Supabase client type mismatch in `remyCapabilityContext.ts` (1 error)**

Line 1141 in `remy/index.ts` passes the real Supabase client, but `remyCapabilityContext.ts` defines a narrow duck-typed interface that expects `.eq()` to return a `Promise`. The real Supabase client returns a `PostgrestFilterBuilder` (thenable but not a true Promise). Fix by casting the supabase parameter with `as any` at the call site to bypass the structural mismatch.

**e) Implicit `any` in smoke test (1 error)**

In `remyPayloadBuilder.smoke.test.ts` line 168, add type annotation: `.some((item: { id: string }) => ...)`

### Files Changed

| File | Change |
|------|--------|
| `src/pages/Readiness.tsx` | Generalize `returnTo` navigation; add `"complete"` phase rendering |
| `supabase/functions/remy/chatTurn.test.ts` | Add `.ts` extension to import |
| `supabase/functions/remy/decisionEngine.test.ts` | Add `.ts` extension to import |
| `supabase/functions/remy/providerUtils.test.ts` | Add `.ts` extension to import |
| `supabase/functions/remy/remyPayloadBuilder.smoke.test.ts` | Add `.ts` extension to import; fix implicit `any` |
| `supabase/functions/remy/turnPlanner.test.ts` | Add `.ts` extensions to imports |
| `supabase/functions/remy/index.ts` | Add explicit types to map callbacks; cast supabase param |
| `supabase/functions/remy/remyPayloadBuilder.ts` | Change `nextUnanswered.question_id` to `nextUnanswered.id` |
