

# Unauthenticated Home Page Overhaul: Bento Feature Grid with Interactive Animations

## Vision

Transform the landing page from a generic "vibecoded" look into a polished, professional experience inspired by Attio's homepage. The key change is replacing the floating heart illustration and static cards with a **bento grid** of feature previews, each containing **real, interactive UI mockups** that animate to demonstrate Rest Easy's core functionality.

## What We're Replacing

### Current State (Hero.tsx + Solution.tsx)
- Floating heart logo with blur glow effects
- Generic floating cards with static stats ("Findability Score 87%")
- Tab-based score cards that feel like a typical SaaS template
- Decorative blurred circles that scream "AI-generated"

### New State
- Clean hero with headline, subtext, and CTA buttons (left-aligned on desktop)
- Bento grid with 3-4 interactive feature previews (right side on desktop, below on mobile)
- Each bento cell has: icon, title, subtitle, and a **live animated UI mockup**

## Bento Grid Design

### Layout
```text
Desktop (lg:grid-cols-2):
+---------------------------+----------------------------+
|                           |  [Bento 1]    [Bento 2]   |
|  Hero Content             |  +----------+ +----------+ |
|  - Badge                  |  | Question | | Progress | |
|  - Headline               |  | Flow     | | Journey  | |
|  - Subtext                |  +----------+ +----------+ |
|  - CTA Buttons            |                            |
|                           |  [Bento 3: Roadmap - spans full width] |
+---------------------------+----------------------------+

Mobile (stacked):
- Hero Content (full width)
- Bento cards (stacked vertically)
```

### Bento Cells

#### 1. "One Question at a Time" (Assessment Flow Demo)
- **Icon**: `MessageCircle` or custom
- **Title**: Thoughtful Assessment
- **Subtitle**: Gentle, one question at a time
- **Animation**: Cycles through 3 sample questions with answer buttons that auto-select, simulating the assessment flow. Uses CSS transitions for smooth in/out.

#### 2. "Your Journey" (Progress Visualization)
- **Icon**: `Compass` or `Map`
- **Title**: Track Your Progress
- **Subtitle**: See your journey unfold section by section
- **Animation**: Shows a mini journey timeline with nodes that fill in one by one (completed, current, upcoming states)

#### 3. "Personalized Roadmap" (Action Items Demo)
- **Icon**: `Target` or `CheckCircle`
- **Title**: Clear Action Roadmap
- **Subtitle**: Know exactly what to do next
- **Animation**: Shows 2-3 roadmap items with one animating from "to-do" to "completed" (checkbox filling, strikethrough)

#### 4. (Optional) "Your Readiness Score" (Score Reveal)
- **Icon**: `Award` or `Shield`
- **Title**: Your Readiness Score
- **Subtitle**: Understand where you stand at a glance
- **Animation**: Circular progress that animates from 0 to 72%, with tier badge appearing

## Animation Approach

All animations use:
- **CSS keyframes** defined in index.css or inline styles
- **`animation-play-state`** toggling for pause/resume
- **Staggered delays** using CSS custom properties
- **No JavaScript intervals** for the actual animations (only React state for cycling content if needed)
- **`will-change: transform, opacity`** for GPU acceleration

### Example Animation Sequence for Question Flow:
```css
@keyframes question-cycle {
  0%, 30% { opacity: 1; transform: translateY(0); }
  35%, 100% { opacity: 0; transform: translateY(-10px); }
}
```

React cycles through questions every 4s, CSS handles the smooth transition.

## Component Structure

### New Files
| File | Purpose |
|------|---------|
| `src/components/landing/BentoGrid.tsx` | Container component for the bento layout |
| `src/components/landing/BentoCard.tsx` | Reusable bento cell with icon, title, subtitle, children |
| `src/components/landing/demos/QuestionFlowDemo.tsx` | Animated question flow mockup |
| `src/components/landing/demos/JourneyProgressDemo.tsx` | Animated journey timeline mockup |
| `src/components/landing/demos/RoadmapDemo.tsx` | Animated roadmap completion mockup |
| `src/components/landing/index.ts` | Barrel exports |

### Modified Files
| File | Changes |
|------|---------|
| `src/components/Hero.tsx` | Complete rewrite - remove floating cards, add bento grid |
| `src/components/Solution.tsx` | Simplify or remove (bento grid replaces feature showcase) |
| `src/index.css` | Add new keyframe animations for demo components |

## Visual Styling

### BentoCard
```text
- Border: subtle border-border/50
- Background: bg-card with subtle gradient hover
- Border-radius: rounded-2xl (matching existing card radius)
- Shadow: shadow-soft, elevates on hover
- Padding: p-5 for content area, demo area has separate padding
```

### Demo Area (inside BentoCard)
```text
- Background: bg-muted/30 or bg-secondary/20 (slightly recessed)
- Border-radius: rounded-xl (inner radius)
- Overflow: hidden (clips animations)
- Height: fixed aspect ratio (e.g., 4:3) for consistency
```

### Color Palette
Uses existing Rest Easy tokens:
- Primary (sage green) for active states
- Muted for inactive/upcoming
- Border for subtle separators
- Pure white background for clean aesthetic

## Animation Details

### QuestionFlowDemo
- 3 questions cycle every 4 seconds
- Each shows question text + 3-4 answer options
- One answer "auto-selects" with a slight delay (0.8s after question appears)
- Selection shows checkmark animation (existing `animate-check-pop`)
- Transition out: question slides up + fades, new question slides in from below

### JourneyProgressDemo  
- 5-6 journey nodes (Legal, Financial, Healthcare, etc.)
- Starts with 2 completed, 1 current (pulsing), rest upcoming
- Every 3s, current node completes (checkmark appears), next becomes current
- Uses existing journey node styling from `JourneyNode.tsx`

### RoadmapDemo
- Shows 3 action items
- First item has animated completion (checkbox fills, text crosses out)
- Loops: item 1 completes, resets, item 2 completes, etc.
- Uses existing roadmap styling from `RoadmapCard.tsx`

## Accessibility

- Animations respect `prefers-reduced-motion` - fallback to static display
- All demo content has `aria-hidden="true"` (decorative)
- Focus remains on actual CTA buttons in hero content

## Responsive Behavior

| Breakpoint | Layout |
|------------|--------|
| Mobile (< 768px) | Hero stacked above, bentos in 1-column grid below |
| Tablet (768px-1024px) | Hero stacked above, bentos in 2-column grid |
| Desktop (> 1024px) | Hero left (50%), bentos right (50%) in 2x2 grid |

## Implementation Order

1. Create `BentoCard.tsx` base component
2. Create `QuestionFlowDemo.tsx` with cycling animation
3. Create `JourneyProgressDemo.tsx` with timeline animation
4. Create `RoadmapDemo.tsx` with completion animation
5. Create `BentoGrid.tsx` to compose the demos
6. Rewrite `Hero.tsx` to integrate bento grid
7. Add new CSS keyframes to `index.css`
8. Simplify/remove `Solution.tsx` (or repurpose for stats/trust section)

## Success Criteria

- Landing page feels "crafted" not "generated"
- Animations are smooth (60fps) and non-distracting
- Users immediately understand what Rest Easy does without reading
- Mobile experience is just as polished as desktop
- No performance regressions (animations are GPU-accelerated)

