

# Landing Page Overhaul: Staggered Journey Section with Report Generation Demo

## Overview

Reorganize the landing page to tell the user's story through a new **Journey Section** below the hero. This section will feature all four bento cards in a staggered layout, each paired with descriptive content that explains the flow a user takes from assessment to actionable roadmap.

## New Structure

### Current Flow
```
Hero (with BentoGrid embedded)
     |
     v
Solution Section
```

### New Flow
```
Hero (simplified - text + CTAs only, no bento grid)
     |
     v
Journey Section (NEW - 4 staggered bento cards with descriptions)
     |
     v
Solution Section (paths to Findability vs Life Readiness)
```

## Journey Section Design

### Layout Pattern (Alternating Left/Right)

Each "journey step" consists of a bento card demo on one side and descriptive content on the other, alternating sides for visual interest:

```
+------------------------------------------------------------------+
|  STEP 1: ASSESSMENT                                              |
|  +------------------------+  +------------------------------+    |
|  | QuestionFlowDemo       |  | "Start with Thoughtful       |    |
|  | (Bento Card)           |  |  Questions"                  |    |
|  |                        |  | Description text about the   |    |
|  +------------------------+  | gentle assessment process... |    |
|                              +------------------------------+    |
+------------------------------------------------------------------+
|  STEP 2: PROGRESS                                                |
|  +------------------------------+  +------------------------+    |
|  | "Track Your Journey"         |  | JourneyProgressDemo    |    |
|  | Description about seeing     |  | (Bento Card)           |    |
|  | progress unfold...           |  |                        |    |
|  +------------------------------+  +------------------------+    |
+------------------------------------------------------------------+
|  STEP 3: REPORT (NEW)                                            |
|  +------------------------+  +------------------------------+    |
|  | ReportGenerationDemo   |  | "Your Personalized Report"  |    |
|  | (Bento Card)           |  | Description about AI-powered|    |
|  |                        |  | analysis and insights...    |    |
|  +------------------------+  +------------------------------+    |
+------------------------------------------------------------------+
|  STEP 4: ROADMAP                                                 |
|  +------------------------------+  +------------------------+    |
|  | "Clear Action Steps"         |  | RoadmapDemo            |    |
|  | Description about knowing    |  | (Bento Card)           |    |
|  | exactly what to do next...   |  |                        |    |
|  +------------------------------+  +------------------------+    |
+------------------------------------------------------------------+
```

### Mobile Layout
All steps stack vertically with bento card above description.

## New Component: ReportGenerationDemo

This is the fourth bento card showing the report generation and preview experience.

### Animation Sequence (15-second loop)

1. **Phase 1: Generating (0-6s)**
   - Progress bar animates from 0% to 100%
   - Step indicators cycle through: "Gathering responses" -> "Analyzing" -> "Generating insights" -> "Preparing report"
   - Mimics the actual `ReportLoading` component behavior

2. **Phase 2: Report Preview (6-15s)**
   - Smooth transition to mini report preview
   - Shows a condensed mock report with:
     - Score circle (animates to 78)
     - "Well Prepared" tier badge
     - Mini section headers scrolling up
   - Auto-scrolls through the report content to simulate reading

3. **Loop Reset**
   - Fades out, restarts from generating phase

### Visual Design
- Icon: `FileText` or `Sparkles`
- Title: "Personalized Insights"
- Subtitle: "AI-powered report generation"
- Demo area shows the two-phase animation

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/landing/JourneySection.tsx` | New section with 4 staggered journey steps |
| `src/components/landing/JourneyStep.tsx` | Reusable component for one step (card + description) |
| `src/components/landing/demos/ReportGenerationDemo.tsx` | New animated demo for report generation |

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/Hero.tsx` | Remove BentoGrid, keep only hero text + CTAs |
| `src/components/landing/BentoGrid.tsx` | Remove (no longer needed at top level) |
| `src/components/landing/index.ts` | Export new components |
| `src/pages/Index.tsx` | Add JourneySection between Hero and Solution |
| `src/index.css` | Add new animations for report generation demo |

## Journey Step Content

### Step 1: Assessment
- **Badge**: "Step 1"
- **Title**: "Start with Thoughtful Questions"
- **Description**: "Our gentle assessment guides you through one question at a time, covering everything from legal documents to digital accounts. No overwhelm, just clarity."
- **Demo**: `QuestionFlowDemo`

### Step 2: Progress
- **Badge**: "Step 2"
- **Title**: "See Your Journey Unfold"
- **Description**: "Track your progress across all life areas. Watch as each section completes, giving you a clear picture of where you stand and what's left to cover."
- **Demo**: `JourneyProgressDemo`

### Step 3: Report (NEW)
- **Badge**: "Step 3"
- **Title**: "Receive Personalized Insights"
- **Description**: "Our AI analyzes your responses to generate a comprehensive readiness report. Understand your strengths, identify gaps, and get tailored recommendations."
- **Demo**: `ReportGenerationDemo`

### Step 4: Roadmap
- **Badge**: "Step 4"
- **Title**: "Follow Your Action Roadmap"
- **Description**: "Know exactly what to do next with a prioritized action plan. Check off tasks as you complete them, and watch your readiness score climb."
- **Demo**: `RoadmapDemo`

## Animation Details

### ReportGenerationDemo Phases

**Phase 1: Generating**
```typescript
const generatingSteps = [
  { icon: ClipboardList, label: "Gathering responses" },
  { icon: Brain, label: "Analyzing readiness" },
  { icon: Sparkles, label: "Generating insights" },
  { icon: FileText, label: "Preparing report" },
];
```
- Progress bar smoothly fills
- Steps highlight one by one with checkmarks
- Similar visual to `ReportLoading.tsx` but compact

**Phase 2: Report Preview**
- Score circle animates from 0 to 78
- Tier badge appears ("Well Prepared")
- Scrolling content shows:
  - "Executive Summary" section header
  - "Key Strengths" section
  - "Areas to Address" section
- Uses CSS `translateY` animation with `overflow: hidden` container

### CSS Keyframes to Add

```css
@keyframes report-scroll {
  0%, 10% { transform: translateY(0); }
  25% { transform: translateY(-60px); }
  50% { transform: translateY(-120px); }
  75% { transform: translateY(-180px); }
  90%, 100% { transform: translateY(-180px); }
}

@keyframes score-count-up {
  0% { --score: 0; }
  100% { --score: 78; }
}
```

## Technical Implementation

### JourneySection Component

```typescript
interface JourneyStepData {
  step: number;
  title: string;
  description: string;
  demo: React.ReactNode;
}

const JourneySection = () => {
  const steps: JourneyStepData[] = [
    { step: 1, title: "Start with Thoughtful Questions", ... },
    { step: 2, title: "See Your Journey Unfold", ... },
    { step: 3, title: "Receive Personalized Insights", ... },
    { step: 4, title: "Follow Your Action Roadmap", ... },
  ];

  return (
    <section className="py-20 lg:py-32 bg-background">
      {steps.map((step, index) => (
        <JourneyStep 
          key={step.step}
          {...step}
          reversed={index % 2 === 1} // Alternate layout
        />
      ))}
    </section>
  );
};
```

### JourneyStep Component

```typescript
interface JourneyStepProps {
  step: number;
  title: string;
  description: string;
  demo: React.ReactNode;
  reversed?: boolean;
}

const JourneyStep = ({ step, title, description, demo, reversed }: JourneyStepProps) => {
  return (
    <div className={cn(
      "container mx-auto px-4 lg:px-8 py-12",
      "grid lg:grid-cols-2 gap-8 lg:gap-16 items-center",
      reversed && "lg:[&>*:first-child]:order-2"
    )}>
      {/* Demo */}
      <BentoCard icon={...} title={...} subtitle={...}>
        {demo}
      </BentoCard>

      {/* Content */}
      <div className="space-y-4">
        <Badge>Step {step}</Badge>
        <h3 className="font-display text-2xl lg:text-3xl font-semibold">{title}</h3>
        <p className="font-body text-lg text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};
```

## Accessibility

- All demo animations have `aria-hidden="true"`
- Respects `prefers-reduced-motion` - static states shown instead
- Step badges provide clear visual ordering
- Content remains readable without animations

## Responsive Behavior

| Breakpoint | Behavior |
|------------|----------|
| Mobile | Stacked layout, demo above description |
| Tablet | Same as mobile but larger cards |
| Desktop | Side-by-side with alternating positions |

## Implementation Order

1. Create `ReportGenerationDemo.tsx` with two-phase animation
2. Create `JourneyStep.tsx` reusable component
3. Create `JourneySection.tsx` composing all 4 steps
4. Simplify `Hero.tsx` to remove BentoGrid
5. Update `Index.tsx` to include JourneySection
6. Add new CSS keyframes to `index.css`
7. Update barrel exports in `landing/index.ts`
8. Optionally remove `BentoGrid.tsx` or keep for other uses

## Success Criteria

- User immediately understands the 4-step journey at a glance
- Report generation demo feels polished and "real"
- Animations are smooth and non-distracting
- Mobile experience maintains the narrative flow
- No performance issues from multiple concurrent animations

