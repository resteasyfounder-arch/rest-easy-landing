

## Remy Section Redesign - Bento Style with Interactive Demo

This plan redesigns the Remy section to use a bento-style layout with an interactive demo showing a simulated conversation with Remy, replacing the current pulse/shimmer animations with a cleaner, more engaging design.

---

### Visual Design Concept

The new section will feature:
- A two-column bento-style layout (stacked on mobile)
- Left card: Remy introduction with the new avatar image and capability highlights
- Right card: Interactive demo showing a simulated "Ask Remy" conversation flow
- Clean animations focused on the demo interaction, not background effects

---

### Interactive Demo: "Ask Remy a Question"

The demo will cycle through example conversations:

**Example Interactions:**
1. User: "What should I focus on first?" → Remy: "Based on your assessment, I'd prioritize updating your healthcare directive..."
2. User: "Why is my legal score low?" → Remy: "Your legal readiness score is 45% because you haven't completed a will yet..."
3. User: "What's next after I finish the will?" → Remy: "Great progress! Next, let's look at your digital accounts..."

**Animation Flow:**
- Typing indicator appears (3 dots pulsing)
- User question fades in
- Brief pause, then Remy's response types in character by character
- Transition to next question after delay

---

### Implementation Steps

**1. Copy Remy Avatar to Project**

Copy the uploaded image to `src/assets/remy-avatar.png` for use in the component.

**2. Create RemyChatDemo Component**

New file: `src/components/landing/demos/RemyChatDemo.tsx`

- Cycles through 3 example Q&A conversations
- Shows a simplified chat interface with:
  - Remy avatar on responses
  - Typing indicator animation
  - Smooth text reveal for responses
- Uses existing animation patterns from QuestionFlowDemo

**3. Redesign RemySection Component**

Update `src/components/landing/RemySection.tsx`:

Layout structure:
```text
+------------------------------------------+
|          Meet Remy — Your Personal       |
|           Rest Easy Manager              |
|        (centered headline + subtext)     |
+------------------------------------------+
|                                          |
|  +----------------+  +----------------+  |
|  | Remy Avatar    |  | "Ask Remy"     |  |
|  | Intro card     |  |  Demo          |  |
|  | with 3 caps    |  |  (chat flow)   |  |
|  +----------------+  +----------------+  |
|                                          |
|           [Talk with Remy] CTA           |
+------------------------------------------+
```

- Remove all pulse ring animations and shimmer overlay
- Use BentoCard-style styling for consistency
- Include the new Remy avatar image
- Keep the 3 capability highlights in a more compact format

**4. Update CSS Animations**

Clean up `src/index.css`:
- Remove `animate-remy-pulse` and `animate-remy-shimmer` (no longer needed)
- Keep `animate-remy-float` for subtle avatar movement
- Add new animations for the chat demo:
  - `@keyframes typing-dot` - Pulsing dots for typing indicator
  - `@keyframes message-appear` - Fade in for chat messages

---

### Content Preservation

All existing content will be preserved:
- **Headline**: "Meet Remy — Your Personal Rest Easy Manager"
- **Subheadline**: "A calm, trustworthy companion who helps you understand your Life Readiness journey and guides you toward peace of mind."
- **Capabilities**: Understands Your Journey, Explains in Plain Language, Adapts as Life Changes
- **CTA**: "Talk with Remy" (disabled with "Coming soon")

---

### Files to Create/Modify

| File | Action |
|------|--------|
| `src/assets/remy-avatar.png` | Copy from user upload |
| `src/components/landing/demos/RemyChatDemo.tsx` | Create new demo component |
| `src/components/landing/RemySection.tsx` | Redesign with bento layout |
| `src/index.css` | Update animations (remove old, add new) |

---

### Accessibility Considerations

- Chat demo respects `prefers-reduced-motion`
- Remy avatar has proper alt text
- Demo is purely decorative (aria-hidden)
- All content remains accessible without animations

