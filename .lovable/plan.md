

## Redesign Pricing as a Progressive Journey

Replace the current three-column pricing grid and feature breakdown with a vertical, step-based layout that reads like a natural progression. This approach is calmer, clearer, and better suited for an older adult audience.

---

### What Changes

**File:** `src/components/Solution.tsx` -- Full rewrite

---

### New Section Structure

#### Header
- Headline: **"Choose how far you want to go"**
- Subtext: "Start with a simple check, understand your full readiness, or unlock tools to take action and stay organized."
- Remove the "Choose Your Path" badge -- keep it clean and direct

#### Step 1: Findability Assessment (Free)
- Step label badge: "Step 1"
- Title: "Findability Assessment"
- Price: "Free"
- Description paragraph explaining the value in plain language
- Bullet list (no checkmarks, just clean text with subtle icons):
  - A short findability assessment
  - A simple summary of strengths and gaps
  - No account required
  - No credit card
- CTA button (outline variant): "Start Free Findability Check"

#### Step 2: Life Readiness Assessment ($99)
- Step label badge: "Step 2"
- Title: "Life Readiness Assessment"
- Price: "$99 one-time"
- Description paragraph
- Bullet list:
  - Full Life Readiness Assessment
  - Personalized scores and insights
  - A clear, easy-to-read readiness report
  - Guidance from Remy, your AI guide
- CTA button (primary/solid): "Get My Life Readiness Report"
- Visual emphasis: Subtle left border accent or slightly larger card to signal this is the foundation for everything after

#### Step 3: Rest Easy Pro ($14.99/mo)
- Step label badge: "Step 3"
- Title: "Rest Easy Pro"
- Price: "$14.99 / month"
- Prerequisite note (muted but clearly visible): "Requires completion of the $99 Life Readiness Assessment"
- Description paragraph
- Bullet list:
  - Actionable Roadmap inside the dashboard
  - Progress tracking toward readiness goals
  - EasyVault secure document storage
  - Continued guidance from Remy
  - Everything included in the previous steps
- CTA button (primary variant): "Upgrade to Pro"

---

### Visual Design

- **Layout**: Single-column, vertically stacked cards (max-width ~700px, centered)
- **Progress connector**: A thin vertical line or dashed connector between steps (similar to the existing `JourneyPath` pattern) to reinforce the sequential flow
- **Step badges**: Small `Badge` components labeled "Step 1", "Step 2", "Step 3"
- **Step 2 emphasis**: A subtle `border-l-4 border-primary` left accent to visually anchor it as the key step
- **Step 3 prerequisite**: A small muted note with an info-style presentation below the price
- **Icons**: One icon per step (Search, Activity, Shield) placed inline with the title -- not in large hero circles
- **Bullet points**: Use a small dot or subtle circle icon instead of checkmarks -- keeping it conversational, not checklist-like
- **No feature comparison grid** at the bottom -- the step descriptions themselves make the progression clear
- **Scroll animations**: Each step uses `AnimatedItem` with staggered delays

---

### What Gets Removed

- The three-column pricing card grid
- The "What's Included" feature breakdown section below the cards
- The `features` array with `included` boolean matrix
- The `tiers` array and `tierNames` constant
- "Most Popular" badge and premium background styling

### What Gets Added

- A `steps` data array containing step number, title, price, description, bullet points, CTA text, href, and visual config
- Vertical step layout with connector lines between cards
- Prerequisite callout for Step 3
- Calmer, plain-language copy throughout

---

### Technical Notes

- Same file, same component name, same exports
- Uses existing components: `Card`, `CardContent`, `Badge`, `Button`, `Separator`
- Uses existing animation utilities: `AnimatedSection`, `AnimatedItem`
- Uses existing icons from lucide-react
- No new dependencies or files needed
