

## Meet Remy Section - AI Virtual Assistant Introduction

This plan adds a dedicated section to the landing page introducing Remy, the Rest Easy AI assistant. The section will be warm, professional, and positioned between the "Your Path to Life Readiness" journey section and the "Two Paths Forward" solution section.

---

### Visual Design Concept

The section will feature a centered, soft card panel with:
- A custom animated Remy avatar/icon placeholder (calm, minimal)
- Warm headline: "Meet Remy - Your Personal Rest Easy Manager"
- Three capability highlights with subtle icons
- A primary CTA button: "Talk with Remy"
- A unique "breathing glow" animation that creates a calming presence

---

### Custom Animation: "Remy Presence"

A signature animation for Remy's introduction featuring:
- **Soft Pulse Ring**: Concentric circles that gently expand from Remy's avatar, creating a calm, "alive" presence
- **Gradient Shimmer**: A subtle light sweep across the card that emphasizes warmth and intelligence
- **Icon Float**: The Remy avatar gently floats to convey approachability

```text
Animation Keyframes:
1. remy-pulse - Expanding rings from avatar (opacity fade out)
2. remy-shimmer - Horizontal light sweep across card
3. remy-float - Gentle vertical bob for avatar
```

---

### Implementation Steps

**1. Create RemySection Component**

New file: `src/components/landing/RemySection.tsx`

Structure:
- Full-width section with subtle background differentiation
- Centered container with max-width constraint
- Soft card/panel with rounded corners and shadow
- Remy avatar placeholder with animated pulse rings
- Headline, supporting copy, capability list, and CTA

**2. Add Custom CSS Animations**

Update `src/index.css` with:
- `@keyframes remy-pulse` - Expanding ring animation
- `@keyframes remy-shimmer` - Light sweep effect
- `@keyframes remy-float` - Gentle bobbing motion
- Utility classes: `.animate-remy-pulse`, `.animate-remy-shimmer`, `.animate-remy-float`

**3. Update Index Page**

Modify `src/pages/Index.tsx` to:
- Import RemySection component
- Place it between JourneySection and Solution

**4. Export from Landing Index**

Update `src/components/landing/index.ts` to export the new component

---

### Content Structure

**Headline:**
"Meet Remy - Your Personal Rest Easy Manager"

**Subheadline:**
"A calm, trustworthy companion who helps you understand your Life Readiness journey and guides you toward peace of mind."

**Capability Highlights (3 items):**
1. **Understands Your Journey** - "Remy knows your profile, tracks your progress, and remembers where you left off."
2. **Explains in Plain Language** - "Get clear answers about your scores, what they mean, and what to focus on next."
3. **Adapts as Life Changes** - "As your circumstances evolve, Remy adjusts recommendations to keep you on track."

**CTA Button:**
"Talk with Remy" (disabled/placeholder - links to #)

---

### Files to Create/Modify

| File | Action |
|------|--------|
| `src/components/landing/RemySection.tsx` | Create new component |
| `src/index.css` | Add Remy-specific animations |
| `src/pages/Index.tsx` | Import and place RemySection |
| `src/components/landing/index.ts` | Add export |

---

### Accessibility Considerations

- All animations respect `prefers-reduced-motion`
- Remy avatar has appropriate alt text
- CTA button is properly labeled
- Content maintains proper heading hierarchy (h2)
- Animations are decorative and don't convey essential information

