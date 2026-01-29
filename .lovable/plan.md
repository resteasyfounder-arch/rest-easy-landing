

# Fix Journey Section Alternating Layout

## Overview
Swap the alternating pattern so Step 1 starts with text on the left and bento on the right.

## Current vs Desired

**Current:**
- Step 1: Bento | Text
- Step 2: Text | Bento
- Step 3: Bento | Text
- Step 4: Text | Bento

**Desired:**
- Step 1: Text | Bento
- Step 2: Bento | Text
- Step 3: Text | Bento
- Step 4: Bento | Text

## Change

| File | Change |
|------|--------|
| `src/components/landing/JourneySection.tsx` | Flip `reversed` logic from `index % 2 === 1` to `index % 2 === 0` |

## Technical Detail

Change line 53 from:
```typescript
reversed={index % 2 === 1}
```
to:
```typescript
reversed={index % 2 === 0}
```

This makes odd indices (0, 2) have `reversed=true` (text left, bento right) and even indices (1, 3) have `reversed=false` (bento left, text right).

