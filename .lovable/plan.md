

# Dashboard v2: Warm, Journey-Based Home Experience

## Executive Summary

Transform the existing Dashboard from a functional status display into an emotionally engaging "home base" that clearly differentiates between Completed and Incomplete assessment states, guides users toward progress without overwhelm, and maintains a calm, trust-forward visual language suitable for an older audience.

---

## Current State Analysis

### What Exists Today

| Component | Purpose | Status |
|-----------|---------|--------|
| `WelcomeHeader` | Time-aware greeting with context message | Working |
| `ScoreCircle` / `ProgressCircle` | Visual score or progress display | Working |
| `TierBadge` | Readiness tier label (e.g., "On Your Way") | Working |
| `SectionProgressCard` | Section-level progress with status icons | Working |
| `AssessmentCTA` | Smart CTA button based on state | Working |
| `ReportStatusBadge` | Report generation status | Working |

### Current Gaps Identified

1. **No distinct "Incomplete" visual state** - Dashboard looks similar whether assessment is 10% or 100% complete
2. **Missing Report Summary** on completed dashboard - Users must navigate to Results page
3. **No Roadmap/Action Preview** - Action items from report not surfaced on dashboard
4. **Missing Category Breakdown visualization** - Only section progress, no visual strength/opportunity bars
5. **No "locked/blurred" preview sections** for incomplete users to show what they'll unlock
6. **Transition between states** is abrupt - no celebratory moment when completing

---

## Design Architecture

### State-Driven Layout Strategy

```text
+---------------------------------------------------+
|                 DASHBOARD ROUTER                   |
+---------------------------------------------------+
               |                    |
     [isComplete === false]  [isComplete === true]
               |                    |
               v                    v
+---------------------------+  +---------------------------+
|   INCOMPLETE DASHBOARD    |  |   COMPLETED DASHBOARD     |
+---------------------------+  +---------------------------+
| - Progress-focused header |  | - Score + Tier header     |
| - Assessment Progress Card|  | - Readiness Summary Card  |
| - Blurred Preview Cards   |  | - Category Breakdown      |
| - Gentle re-engagement    |  | - Quick Actions/Roadmap   |
| - Section Journey         |  | - Section Review          |
+---------------------------+  +---------------------------+
```

---

## Completed Assessment Dashboard

### Section 1: Score Hero (Top)

**Purpose**: "Where am I?" - Immediate status clarity

```text
+-------------------------------------------------------+
|  ┌─────────────────────────────────────────────────┐  |
|  │                                                 │  |
|  │    [72]           "Well Prepared"               │  |
|  │   ───────         ★ Award Icon                  │  |
|  │                                                 │  |
|  │   "Last updated Jan 25, 2025"                  │  |
|  │                                                 │  |
|  │   [View Full Report]   [Share Report]          │  |
|  │                                                 │  |
|  └─────────────────────────────────────────────────┘  |
+-------------------------------------------------------+
```

**Components**:
- Large `ScoreCircle` (size="lg") centered
- `TierBadge` prominently displayed
- Last completed date from `report.generatedAt`
- Primary CTA: "View Full Report" → `/results`
- Secondary: Share capability

### Section 2: Insight Summary Card (Middle)

**Purpose**: "What does this mean?" - Plain-language interpretation

```text
+-------------------------------------------------------+
|  ┌─────────────────────────────────────────────────┐  |
|  │  📋 Your Readiness Summary                      │  |
|  │  ─────────────────────────────                  │  |
|  │                                                 │  |
|  │  "You've made strong progress in preparing     │  |
|  │  for life's transitions. Your legal documents  │  |
|  │  and healthcare wishes are well documented..." │  |
|  │                                                 │  |
|  │  ✓ 6 strengths identified                      │  |
|  │  ○ 4 areas to address                          │  |
|  │                                                 │  |
|  └─────────────────────────────────────────────────┘  |
+-------------------------------------------------------+
```

**Data Source**: Fetch report `executive_summary` (first 2-3 sentences truncated) + `metrics`

### Section 3: Category Breakdown (Middle)

**Purpose**: Visual strength vs. opportunity at-a-glance

```text
+-------------------------------------------------------+
|  ┌─────────────────────────────────────────────────┐  |
|  │  Category Scores                  [View Details]│  |
|  │  ─────────────────────────────                  │  |
|  │                                                 │  |
|  │  Legal Documents        ████████████░░  85%    │  |
|  │  Healthcare Wishes      ██████████░░░░  72%    │  |
|  │  Financial Affairs      ████████░░░░░░  58%    │  |
|  │  Digital Assets         █████░░░░░░░░░  42%    │  |
|  │  Family Communication   ████████████░░  89%    │  |
|  │                                                 │  |
|  └─────────────────────────────────────────────────┘  |
+-------------------------------------------------------+
```

**Component**: New `CategoryBreakdown` component
- Uses data from `assessmentState.sections` (already has scores)
- Color-coded bars: Green (70+), Amber (40-69), Red (<40)
- "View Details" links to specific section in report

### Section 4: Quick Actions / Roadmap (Bottom)

**Purpose**: "What should I do next?" - Lightweight, achievable tasks

```text
+-------------------------------------------------------+
|  ┌─────────────────────────────────────────────────┐  |
|  │  Recommended Next Steps              [View All] │  |
|  │  ─────────────────────────────                  │  |
|  │                                                 │  |
|  │  🔴 HIGH: Review your healthcare directive     │  |
|  │     "Ensure your wishes are clearly documented" │  |
|  │     [Start Task]                                │  |
|  │                                                 │  |
|  │  🟡 MEDIUM: Organize digital account access    │  |
|  │     "Create a secure list of important logins" │  |
|  │     [Start Task]                                │  |
|  │                                                 │  |
|  └─────────────────────────────────────────────────┘  |
+-------------------------------------------------------+
```

**Data Source**: Top 2-3 items from report `action_plan` or `immediate_actions`
- Show priority badge (HIGH/MEDIUM)
- Keep descriptions short (one line)
- "View All" → `/results` (scrolls to Action Plan section)

---

## Incomplete Assessment Dashboard

### Section 1: Progress Hero (Top - Primary Focus)

**Purpose**: Clear re-engagement with progress visibility

```text
+-------------------------------------------------------+
|  ┌─────────────────────────────────────────────────┐  |
|  │                                                 │  |
|  │    [42%]          "You're making progress!"    │  |
|  │    ○○○○●          3 of 7 sections completed    │  |
|  │                                                 │  |
|  │    ─────────────────────────────                │  |
|  │    ████████████████░░░░░░░░░░░░░░               │  |
|  │                                                 │  |
|  │    "Your readiness score will appear once      │  |
|  │     your assessment is complete"               │  |
|  │                                                 │  |
|  │    [  ▶ Continue Your Assessment  ]            │  |
|  │                                                 │  |
|  │    "Most people complete this in 10-15 min"    │  |
|  │                                                 │  |
|  └─────────────────────────────────────────────────┘  |
+-------------------------------------------------------+
```

**Key Elements**:
- `ProgressCircle` (size="lg") with percentage
- Section milestone chip ("3 of 7 sections")
- Progress bar
- Explicit message: score reveals on completion
- Primary CTA: "Continue Your Assessment"
- Reassurance microcopy

### Section 2: Section Journey (In-Progress State)

**Purpose**: Show progress and highlight next section

```text
+-------------------------------------------------------+
|  ───── Your Assessment Journey ─────                  |
|                                                       |
|  ✓ Personal & Family Information       Complete  78% |
|  ✓ Healthcare Wishes                   Complete  85% |
|  → Financial Affairs                   Continue  40% | ← Highlighted
|  ○ Legal Documents                     Locked        |
|  ○ Digital Assets                      Locked        |
+-------------------------------------------------------+
```

**Enhancement**: Add `isNext` prop to `SectionProgressCard` to highlight the recommended next section

### Section 3: Locked Preview Cards (New)

**Purpose**: Show users what they'll unlock - creates anticipation

```text
+-------------------------------------------------------+
|  ┌─────────────────────────────────────────────────┐  |
|  │  🔒 Your Readiness Score                        │  |
|  │  ─────────────────────────────                  │  |
|  │                                                 │  |
|  │  [      BLURRED/MUTED PREVIEW      ]           │  |
|  │  [      of ScoreCircle component   ]           │  |
|  │                                                 │  |
|  │  "Complete the assessment to see your          │  |
|  │   personalized readiness score"                │  |
|  │                                                 │  |
|  └─────────────────────────────────────────────────┘  |
|                                                       |
|  ┌─────────────────────────────────────────────────┐  |
|  │  🔒 Your Personalized Roadmap                   │  |
|  │  ─────────────────────────────                  │  |
|  │                                                 │  |
|  │  [      BLURRED PREVIEW of action items  ]     │  |
|  │                                                 │  |
|  │  "Unlock your step-by-step action plan"        │  |
|  │                                                 │  |
|  └─────────────────────────────────────────────────┘  |
+-------------------------------------------------------+
```

**Component**: New `LockedPreviewCard` component
- Semi-transparent overlay with lock icon
- Placeholder content that hints at value
- Encouraging unlock message

---

## New Components to Create

### 1. `CategoryBreakdown.tsx`

Horizontal bar chart showing section scores with color coding.

```typescript
interface CategoryBreakdownProps {
  sections: SectionState[];
  onCategoryClick?: (sectionId: string) => void;
}
```

### 2. `QuickActionsCard.tsx`

Displays top 2-3 action items from the report.

```typescript
interface QuickActionsCardProps {
  actions: ImmediateAction[] | ActionItem[];
  maxItems?: number;
  onViewAll?: () => void;
}
```

### 3. `ReportSummaryCard.tsx`

Truncated executive summary with key metrics.

```typescript
interface ReportSummaryCardProps {
  summary: string;
  metrics: ReportMetrics;
  onViewReport?: () => void;
}
```

### 4. `LockedPreviewCard.tsx`

Blurred/muted preview of completed features.

```typescript
interface LockedPreviewCardProps {
  title: string;
  description: string;
  previewContent?: ReactNode;
  icon?: LucideIcon;
}
```

---

## Data Flow Changes

### Report Data on Dashboard

Currently, the Dashboard only uses `assessmentState` from `useAssessmentState`. For the completed dashboard to show report summary and actions, we need to:

**Option A (Recommended)**: Extend `useAssessmentState` to optionally fetch report preview data
```typescript
const { assessmentState, reportPreview } = useAssessmentState({ 
  autoRefresh: true,
  includeReportPreview: isComplete  // Only fetch if complete
});
```

**Option B**: Create a lightweight `/agent` action that returns dashboard-specific report snippets
```json
{
  "action": "get_dashboard_preview",
  "subject_id": "...",
  "fields": ["executive_summary", "immediate_actions", "metrics"]
}
```

For v2, **Option A is simpler** - we fetch the full report data only when `isComplete` is true.

---

## Transition Animations

### Assessment Completion Moment

When assessment goes from 99% to 100%:

1. Progress circle animates to 100%
2. Brief pause (500ms)
3. Circle morphs into ScoreCircle with score reveal animation
4. TierBadge fades in with scale animation
5. New dashboard sections fade in sequentially

**CSS Animations** (already available in project):
- `animate-fade-in`
- `animate-scale-in`
- Custom: `animate-score-reveal` (counter animation)

---

## Accessibility Considerations

| Element | Consideration |
|---------|---------------|
| Font sizes | Minimum 16px body, 14px secondary |
| Color contrast | All text meets WCAG AA (4.5:1) |
| Progress bars | Include text percentage, not just visual |
| Buttons | Large touch targets (44px minimum) |
| Icons | Always paired with text labels |
| Focus states | Visible focus rings on all interactive elements |

---

## Files to Create/Modify

### New Files

| File | Purpose |
|------|---------|
| `src/components/dashboard/CategoryBreakdown.tsx` | Section score bars |
| `src/components/dashboard/QuickActionsCard.tsx` | Top action items |
| `src/components/dashboard/ReportSummaryCard.tsx` | Executive summary preview |
| `src/components/dashboard/LockedPreviewCard.tsx` | Blurred incomplete-state cards |

### Modified Files

| File | Changes |
|------|---------|
| `src/pages/Dashboard.tsx` | Complete restructure with state-driven layout |
| `src/components/dashboard/SectionProgressCard.tsx` | Add `isNext` highlighting prop |
| `src/components/dashboard/index.ts` | Export new components |
| `src/hooks/useAssessmentState.ts` | Add optional report preview fetch |

---

## Implementation Sequence

1. **Phase 1: Incomplete Dashboard Enhancement**
   - Add `LockedPreviewCard` component
   - Enhance `SectionProgressCard` with `isNext` highlighting
   - Improve progress messaging and microcopy
   - Add reassurance elements

2. **Phase 2: Completed Dashboard Features**
   - Create `CategoryBreakdown` component
   - Create `ReportSummaryCard` component
   - Create `QuickActionsCard` component
   - Integrate report data fetching

3. **Phase 3: Polish & Transitions**
   - Add completion celebration animation
   - Smooth state transitions
   - Final spacing and visual refinements
   - Mobile responsiveness testing

---

## Visual Design Tokens

Consistent with existing Rest Easy brand:

| Token | Value | Usage |
|-------|-------|-------|
| `--primary` | Sage green `hsl(155 30% 50%)` | CTAs, progress indicators |
| `--accent` | Mint `hsl(160 35% 85%)` | Card backgrounds |
| Border radius | `0.75rem` (12px) | Soft, rounded cards |
| Shadows | `--shadow-soft` | Subtle depth |
| Spacing | `space-y-6` to `space-y-8` | Generous breathing room |

---

## Expected Outcome

### For Incomplete Users
- Clear understanding of progress
- Gentle motivation to continue
- Preview of value they'll unlock
- No confusion about missing score

### For Completed Users
- Immediate clarity on readiness status
- Actionable next steps visible
- Easy access to full report
- Pride in accomplishment

### Overall
- Calm, trustworthy visual experience
- Works beautifully on mobile and desktop
- Accessible for older audience
- Seamless transitions between states

