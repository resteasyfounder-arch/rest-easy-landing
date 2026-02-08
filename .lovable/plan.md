

## Redesign Pricing Section with Feature Descriptions

### Changes Overview

Update `src/components/Solution.tsx` to:
- Change Rest Easy Pro from $199 one-time to **$14.99/month subscription**
- Move **Remy AI Guide** into the Readiness tier (included in both Readiness and Pro)
- Add **descriptive sub-text** under each feature explaining what it includes
- Use shadcn `Separator`, `Tooltip`, and enhanced `Card` styling to visually differentiate tiers

---

### Updated Tier Matrix

| Feature | Discover (Free) | Readiness ($99 one-time) | Rest Easy Pro ($14.99/mo) |
|---|---|---|---|
| Findability Assessment | Yes | Yes | Yes |
| Life Readiness Assessment | -- | Yes | Yes |
| Personalized Report | -- | Yes | Yes |
| Remy AI Guide | -- | Yes | Yes |
| Actionable Roadmap | -- | -- | Yes |
| EasyVault Document Storage | -- | -- | Yes |

---

### Feature Descriptions

Each feature in the checklist will have a short description underneath the feature name to help users understand the value:

- **Findability Assessment** -- "Quick check to see how easily your loved ones could locate your important information"
- **Life Readiness Assessment** -- "Comprehensive evaluation across 6 life areas to understand your full preparedness picture"
- **Personalized Report** -- "Detailed analysis with scores, strengths, and areas needing attention tailored to your situation"
- **Remy AI Guide** -- "Your personal AI companion that explains results, answers questions, and guides your next steps"
- **Actionable Roadmap** -- "Step-by-step plan with prioritized tasks and progress tracking to improve your readiness score"
- **EasyVault Document Storage** -- "Secure, organized storage for essential documents across 6 categories with progress tracking"

---

### Visual Design Enhancements

- Each tier card uses a shadcn `Separator` between the pricing/CTA area and the feature list for clean visual separation
- Feature descriptions appear as smaller muted text below each feature name
- Rest Easy Pro price displays as **"$14.99"** with **"/month"** styled smaller, and sub-text reads "Cancel anytime"
- The three tiers maintain the existing visual hierarchy: outline for free, highlighted border + "Most Popular" badge for Readiness, subtle premium background for Pro

---

### Technical Details

**Single file change:** `src/components/Solution.tsx`

- Restructure the `features` array to include `{ name, description }` objects instead of plain strings
- Update Remy to `included: [false, true, true, ...]` and reorder features so Remy sits after Personalized Report
- Update Rest Easy Pro tier: `price: "$14.99"`, `priceSub: "/month"`, secondary price note "Cancel anytime"
- Add `Separator` component between CTA button and feature list
- Render feature descriptions as a `<span>` block below each feature name in smaller muted text
- No new dependencies or files needed

