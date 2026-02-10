

## Update Findability Scoring for Better Differentiation

### The Problem

With 8 questions and weights of Yes=10, Somewhat=5, No=0, the scoring clusters too tightly around the middle. For example:
- All "Somewhat" = 50%
- 7 "Somewhat" + 1 "Yes" = 56%
- 6 "Somewhat" + 2 "Yes" = 63%

The jumps between common answer patterns are too small (only ~6 points apart), and "Somewhat" heavy answers always land in the 50s, which feels discouraging for someone who is partially prepared.

### Proposed New Weights

| Answer | Current | Proposed |
|--------|---------|----------|
| Yes | 10 | 10 |
| Somewhat | 5 | 7 |
| No | 0 | 0 |

This shifts "Somewhat" from 50% to 70% of full credit, reflecting that "working on it" is meaningfully closer to "done" than to "not started."

### How Scores Change

| Scenario | Current | New |
|----------|---------|-----|
| All "No" | 0 | 0 |
| All "Somewhat" | 50 | 70 |
| 7 Somewhat + 1 Yes | 56 | 74 |
| 6 Somewhat + 2 Yes | 63 | 78 |
| 4 Somewhat + 4 Yes | 75 | 85 |
| All "Yes" | 100 | 100 |
| 4 Yes + 2 Somewhat + 2 No | 63 | 68 |
| 2 Yes + 3 Somewhat + 3 No | 44 | 51 |

This creates better spread across the three tiers and makes "Somewhat" answers feel appropriately encouraging -- you're more than halfway there, not stuck at the midpoint.

### Tier Thresholds

The existing tier boundaries (Strong >= 70, Unclear >= 40, Fragile < 40) still work well with the new weights. "All Somewhat" now lands in "Strong" rather than "Unclear," which is more accurate -- someone working on all 8 areas is in a strong position.

If you'd prefer "All Somewhat" to stay in the middle tier, we could bump the Strong threshold to 75:

| Option | Strong | Unclear | Fragile |
|--------|--------|---------|---------|
| A (keep current thresholds) | >= 70 | >= 40 | < 40 |
| B (raise Strong threshold) | >= 75 | >= 45 | < 45 |

### Technical Change

**`src/data/findabilityQuestions.ts`** -- one line change:

```ts
export const answerScores: Record<AnswerValue, number> = {
  yes: 10,
  somewhat: 7,  // was 5
  no: 0,
};
```

No other files need to change. The `calculateScore` function already normalizes to a percentage using the max possible score.

