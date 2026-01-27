

# Dashboard v3: Complete Layout Redesign

## Overview

This plan updates the Dashboard to match the provided screenshot design. The new layout introduces:
1. **Side-by-side Score + Vault cards** at the top
2. **Enhanced Report Summary** with strengths and areas to improve columns
3. **Comprehensive Roadmap section** with priority grouping, filters, and progress tracking

The design maintains the existing calm, warm visual language while significantly improving information density and actionability for completed assessments.

---

## Visual Layout Comparison

```text
CURRENT LAYOUT (Vertical stacking)
+------------------------------------------+
| Welcome back          [Log Out]          |
+------------------------------------------+
| ┌──────────────────────────────────────┐ |
| │      [Large Centered Score Circle]   │ |
| │      Tier Badge + Date               │ |
| │      [View Report] [Share]           │ |
| └──────────────────────────────────────┘ |
+------------------------------------------+
| Report Summary Card (full width)         |
+------------------------------------------+
| Category Breakdown Card (full width)     |
+------------------------------------------+
| Quick Actions Card (full width)          |
+------------------------------------------+

NEW LAYOUT (Screenshot-based)
+------------------------------------------+
| Welcome back, Alex         Viewing: [v]  |
| Assessed: Dec 31, 2025     Dec 31, 70%   |
+------------------------------------------+
| ┌─────────────────┐  ┌──────────────────┐|
| │ READINESS SCORE │  │ Easy Vault       │|
| │ 70/100          │  │ (Coming Soon)    │|
| │ On Your Way     │  │                  │|
| │ 3/18 actions    │  │ Legal: 0 docs    │|
| │ [View by Cat.]  │  │ Financial: 0     │|
| │                 │  │ Health: 0        │|
| │ Category Bars   │  │ [Preview Vault]  │|
| │ ──────────────  │  │                  │|
| │ Digital Life    │  └──────────────────┘|
| │ Home, Pets...   │                      |
| │ Financial & I...│                      |
| └─────────────────┘                      |
+------------------------------------------+
| ┌──────────────────────────────────────┐ |
| │ Your Report Summary                  │ |
| │ "Alex, it's great to see..."         │ |
| │                                      │ |
| │ ┌──────────┐  ┌───────────────────┐  │ |
| │ │Strengths │  │Areas to Improve   │  │ |
| │ │✓ Clear..│  │→ Unclear Property │  │ |
| │ │✓ Up-to..│  │→ Home Burdens...  │  │ |
| │ └──────────┘  └───────────────────┘  │ |
| │ View Full Report >                   │ |
| └──────────────────────────────────────┘ |
+------------------------------------------+
| ┌──────────────────────────────────────┐ |
| │ Your Roadmap         [Filters v]     │ |
| │ 15 remaining, 3 completed            │ |
| │ Progress ████░░░░░░░░░░░░░░ 17%      │ |
| │                                      │ |
| │ ● High Priority                      │ |
| │   - Consolidate Your Deed [Start]    │ |
| │   - Address Unresolved Property      │ |
| │   - Discuss Guardianship             │ |
| │   > Show 6 more                      │ |
| │                                      │ |
| │ ● Medium Priority                    │ |
| │   - Complete Decision-Maker List     │ |
| │   - Articulate Symptom Mgmt...       │ |
| │   - Finalize Gifting...              │ |
| └──────────────────────────────────────┘ |
+------------------------------------------+
```

---

## Component Changes

### 1. Enhanced Welcome Header

**File**: `src/components/dashboard/WelcomeHeader.tsx`

Update to include:
- User name display (from profile data or "back" fallback)
- Assessment date badge
- Optional "Viewing" dropdown for future date selection

```tsx
// New props
interface WelcomeHeaderProps {
  userName?: string;
  assessedDate?: string;
  hasStarted?: boolean;
  isComplete?: boolean;
}

// Render two-line header:
// Line 1: "Welcome back, Alex" + viewing selector
// Line 2: "Assessed: Dec 31, 2025" (subtle, left side)
```

### 2. New Readiness Score Card (Left Side)

**File**: `src/components/dashboard/ReadinessScoreCard.tsx` (NEW)

A comprehensive score card that includes:
- Large score display (70/100 format vs circle)
- Tier badge ("On Your Way")
- Actions summary ("3/18 actions")
- "View by Category" button
- Progress indicator ("30 pts to 100")
- Inline category breakdown bars (compact version)
- Footer message about using the roadmap

```tsx
interface ReadinessScoreCardProps {
  score: number;
  tier: ScoreTier;
  actionsRemaining: number;
  actionsTotal: number;
  sections: SectionState[];
  onViewByCategory?: () => void;
}
```

### 3. Easy Vault Card (Right Side - Coming Soon)

**File**: `src/components/dashboard/VaultPreviewCard.tsx` (NEW)

A "coming soon" placeholder card for the document vault feature:
- "Coming Soon" badge in top right
- Description text about secure storage
- Three category rows: Legal, Financial, Health (each showing "0 docs" with "Add" button)
- Encrypted badge
- "Preview Vault" button (disabled or leads to info modal)

```tsx
interface VaultPreviewCardProps {
  onPreview?: () => void;
}
```

### 4. Enhanced Report Summary Card

**File**: `src/components/dashboard/ReportSummaryCard.tsx`

Update to include:
- "Key insights from your assessment" subtitle
- Full executive summary paragraph (not truncated as much)
- Two-column layout at bottom:
  - Left: "Your Strengths" with green checkmarks
  - Right: "Areas to Improve" with amber arrows
- "View Full Report >" link at bottom

```tsx
interface ReportSummaryCardProps {
  summary: string;
  strengths?: Strength[];        // NEW
  areasToImprove?: AttentionArea[]; // NEW
  onViewReport?: () => void;
}
```

### 5. Comprehensive Roadmap Card

**File**: `src/components/dashboard/RoadmapCard.tsx` (NEW)

A full-featured action plan component:
- Header: "Your Roadmap" with stats ("15 remaining, 3 completed")
- Filter dropdowns: "By Priority" and "Remaining/Completed"
- Overall progress bar with percentage
- Priority-grouped action items:
  - **High Priority** (red dot)
  - **Medium Priority** (amber dot)
  - **Low Priority** (optional, gray dot)
- Each action item shows:
  - Title
  - Category badge
  - "Start" button
- "Show X more" expandable sections

```tsx
interface RoadmapCardProps {
  actions: ActionItem[];
  completedCount?: number;
  onActionStart?: (action: ActionItem) => void;
  onViewAll?: () => void;
}
```

### 6. Dashboard Page Restructure

**File**: `src/pages/Dashboard.tsx`

Major layout changes:
- Widen max-width from `max-w-2xl` to `max-w-4xl` for two-column layout
- Use CSS Grid for top section: score card (larger) + vault card
- Replace existing cards with new components
- Keep mobile responsiveness (stack on small screens)

---

## Data Requirements

### Report Preview Enhancement

The current `reportPreview` already contains most needed data:
- `executive_summary` - for summary text
- `strengths` - for strength bullets
- `areas_requiring_attention` - for areas to improve
- `action_plan` - for roadmap items
- `metrics` - for action counts

We may need to add tracking for completed action items (future enhancement).

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/dashboard/ReadinessScoreCard.tsx` | Main score display with inline category bars |
| `src/components/dashboard/VaultPreviewCard.tsx` | Coming soon vault teaser |
| `src/components/dashboard/RoadmapCard.tsx` | Full roadmap with priority grouping |

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Dashboard.tsx` | Complete layout restructure for 2-column grid |
| `src/components/dashboard/WelcomeHeader.tsx` | Add user name, assessment date, viewing selector |
| `src/components/dashboard/ReportSummaryCard.tsx` | Add strengths/areas columns |
| `src/components/dashboard/index.ts` | Export new components |

---

## Detailed Implementation

### ReadinessScoreCard Component

The score card will use a different visual treatment than the current centered circle:

```tsx
// Left-aligned score with inline elements
<Card className="border-border/50">
  <CardContent className="p-6 space-y-6">
    {/* Score Header */}
    <div className="flex items-start justify-between">
      <div>
        <div className="text-sm text-muted-foreground font-medium uppercase tracking-wide">
          Readiness Score
        </div>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-5xl font-bold text-foreground">{score}</span>
          <span className="text-2xl text-muted-foreground">/100</span>
        </div>
        <TierBadge tier={tier} size="sm" className="mt-2" />
      </div>
      
      {/* Actions badge */}
      <div className="text-right">
        <span className="text-sm text-amber-600">
          {actionsRemaining}/{actionsTotal} actions
        </span>
      </div>
    </div>
    
    {/* View by Category button */}
    <Button variant="outline" size="sm">
      View by Category
    </Button>
    
    {/* Progress indicator */}
    <div className="text-xs text-muted-foreground">
      {100 - score} pts to 100
    </div>
    
    {/* Compact category bars */}
    <div className="space-y-2">
      {sections.map(section => (
        <div key={section.id} className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground w-24 truncate">
            {section.label}
          </span>
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className={getScoreColor(section.score)} 
              style={{ width: `${section.score}%` }} 
            />
          </div>
        </div>
      ))}
    </div>
    
    {/* Footer message */}
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <CheckCircle2 className="h-4 w-4 text-primary" />
      Use the roadmap below to keep making progress toward your goals.
    </div>
  </CardContent>
</Card>
```

### VaultPreviewCard Component

A teaser for the upcoming vault feature:

```tsx
<Card className="border-border/50 bg-gradient-to-br from-amber-50/30 to-background">
  <CardContent className="p-6 space-y-4">
    {/* Header with Coming Soon */}
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-2">
        <Vault className="h-5 w-5 text-amber-600" />
        <span className="font-display font-medium">Easy Vault</span>
      </div>
      <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
    </div>
    
    {/* Description */}
    <p className="text-sm text-muted-foreground">
      Securely store documents your family may need.
    </p>
    
    {/* Document categories */}
    <div className="space-y-3">
      {['Legal', 'Financial', 'Health'].map(cat => (
        <div key={cat} className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderIcon className="h-4 w-4" />
            <span className="text-sm">{cat}</span>
            <span className="text-xs text-muted-foreground">0 docs</span>
          </div>
          <Button size="sm" variant="outline" disabled>Add</Button>
        </div>
      ))}
    </div>
    
    {/* Footer */}
    <div className="text-xs text-muted-foreground flex items-center gap-1">
      <Lock className="h-3 w-3" />
      Encrypted and user-controlled
    </div>
    
    <Button variant="outline" className="w-full">
      Preview Vault
      <ArrowRight className="h-4 w-4 ml-2" />
    </Button>
  </CardContent>
</Card>
```

### RoadmapCard Component

Full roadmap with priority grouping:

```tsx
<Card className="border-border/50">
  <CardHeader className="pb-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Map className="h-5 w-5 text-primary" />
        <div>
          <CardTitle className="font-display text-lg">Your Roadmap</CardTitle>
          <p className="text-sm text-muted-foreground">
            {remaining} remaining, {completed} completed
          </p>
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex items-center gap-2">
        <Select defaultValue="priority">
          <SelectTrigger className="w-[120px] h-8">
            <SelectValue placeholder="By Priority" />
          </SelectTrigger>
        </Select>
        <Select defaultValue="remaining">
          <SelectTrigger className="w-[100px] h-8">
            <SelectValue placeholder="Remaining" />
          </SelectTrigger>
        </Select>
      </div>
    </div>
    
    {/* Progress bar */}
    <div className="mt-4 space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Progress</span>
        <span className="font-medium">{progressPercent}%</span>
      </div>
      <Progress value={progressPercent} className="h-2" />
    </div>
  </CardHeader>
  
  <CardContent className="space-y-6">
    {/* High Priority Section */}
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="h-2 w-2 rounded-full bg-rose-500" />
        <span className="font-medium text-rose-600 text-sm">High Priority</span>
      </div>
      <div className="space-y-2">
        {highPriorityActions.map(action => (
          <RoadmapActionItem key={action.title} action={action} />
        ))}
        {hasMoreHigh && (
          <Button variant="ghost" size="sm">
            Show {moreHighCount} more
          </Button>
        )}
      </div>
    </div>
    
    {/* Medium Priority Section */}
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="h-2 w-2 rounded-full bg-amber-500" />
        <span className="font-medium text-amber-600 text-sm">Medium Priority</span>
      </div>
      <div className="space-y-2">
        {mediumPriorityActions.map(action => (
          <RoadmapActionItem key={action.title} action={action} />
        ))}
      </div>
    </div>
  </CardContent>
</Card>

// Sub-component for each action
function RoadmapActionItem({ action }: { action: ActionItem }) {
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30">
      <div className="flex items-center gap-3">
        <Circle className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">{action.title}</span>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-xs">
          {action.category || "General"}
        </Badge>
        <Button size="sm" variant="ghost" className="text-primary">
          Start
        </Button>
      </div>
    </div>
  );
}
```

---

## Mobile Responsiveness

On screens smaller than `lg` (1024px):
- Score card and Vault card stack vertically (vault below score)
- Report Summary columns stack (strengths above areas)
- Roadmap filters become a single row or dropdown
- Action items remain full-width

```tsx
// Grid layout for top section
<div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
  <div className="lg:col-span-3">
    <ReadinessScoreCard ... />
  </div>
  <div className="lg:col-span-2">
    <VaultPreviewCard ... />
  </div>
</div>
```

---

## Preserved Design Principles

1. **Calm, Card-Based Layout** - Soft rounded cards with generous spacing
2. **Clear Visual Hierarchy** - Score at top, insights in middle, actions at bottom
3. **Progress Over Perfection** - Focus on "remaining" actions, not "failed" ones
4. **Warm Color Palette** - Sage greens, muted ambers, soft shadows
5. **Accessible Typography** - Large readable fonts, high contrast

---

## Implementation Sequence

1. Create `ReadinessScoreCard.tsx` with inline category bars
2. Create `VaultPreviewCard.tsx` as coming soon placeholder
3. Create `RoadmapCard.tsx` with priority grouping
4. Update `ReportSummaryCard.tsx` with strengths/areas columns
5. Update `WelcomeHeader.tsx` with user name and date
6. Restructure `Dashboard.tsx` with new grid layout
7. Update exports in `index.ts`
8. Test mobile responsiveness

