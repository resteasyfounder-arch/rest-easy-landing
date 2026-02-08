

## Redesign Hero Banner with Subtle, Reassuring Animations

### What Changes

**Files modified:**
- `src/components/Hero.tsx` -- Rewrite with new animations, updated CTAs, and breathing background
- `src/index.css` -- Add new keyframes for gradient drift, heartbeat pulse, and arrow micro-interaction

---

### Animation Details

#### 1. Background: Breathing Gradient Drift
Add two soft radial gradient blobs (already present as static elements) and animate them with a very slow CSS keyframe:
- 12-15s loop, alternating scale (1.0 to 1.08) and slight position drift
- Opacity shifts of ~3-5%
- Pure CSS, no JS -- uses `@keyframes hero-drift-1` and `hero-drift-2` with offset timing
- Wrapped in `@media (prefers-reduced-motion: no-preference)` so they freeze for reduced-motion users

#### 2. Headline Reveal: Staggered Fade-Up
Keep existing `AnimatedItem` pattern but adjust timing to match the spec:
- Heart logo: 0ms delay, 600ms duration
- Badge removed (per memory: keep hero clean and uncluttered)
- Headline: 100ms delay, 700ms duration, translateY(6px) only (smaller movement than current 24px)
- Subtext: 200ms delay, 700ms duration
- Buttons: 350ms delay, fade only (no translateY)
- Trust indicators: 500ms delay, fade only

To achieve the gentler 6px movement (instead of the default 24px in `AnimatedItem`), the hero will use inline style overrides or a custom wrapper rather than modifying the shared `AnimatedItem`.

#### 3. Heart Logo: Subtle Heartbeat
Add a new CSS keyframe `hero-heartbeat`:
- Scale 1.0 to 1.02 to 1.0 over 7s
- Continuous loop, applied to the heart logo image
- Stops via `@media (prefers-reduced-motion: reduce)` -- sets `animation: none`

#### 4. CTA Micro-interactions
- Primary button ("Log In"): On hover, arrow icon shifts 3px right via `group-hover:translate-x-0.5` transition. On active/tap, `active:scale-[0.98]` with 100ms transition.
- Secondary button ("Sign Up"): Outline variant, same tap scale-down, no arrow.
- No glow, no bounce, no shadow pop.

#### 5. CTA Text Updates
- Primary CTA: Change from "Get Started" to **"Log In"** linking to `/login`
- Secondary CTA: Change from "Learn More" to **"Sign Up"** linking to `/login` (same page for now since auth is simulated)

---

### CSS Additions (in `src/index.css`)

```css
/* Hero breathing gradient */
@keyframes hero-drift-1 { ... }  /* ~14s, scale + slight translate */
@keyframes hero-drift-2 { ... }  /* ~12s, offset timing */
@keyframes hero-heartbeat { ... } /* ~7s, scale 1 -> 1.02 -> 1 */

/* Reduced motion: disable all hero animations */
@media (prefers-reduced-motion: reduce) {
  .animate-hero-drift, .animate-hero-heartbeat { animation: none; }
}
```

---

### What Gets Removed
- The "Life Readiness Platform" `Badge` below the logo (keeping hero minimal per design memory)
- The current blurred background circles replaced with animated versions
- "Get Started" and "Learn More" button text

### What Gets Added
- Animated background gradient blobs (CSS only)
- Heartbeat animation on heart logo
- Arrow micro-interaction on primary CTA
- Tap scale-down on both buttons
- Updated CTA labels and hrefs

---

### Accessibility
- All motion wrapped in `prefers-reduced-motion` media queries
- Text remains static after reveal completes
- Color contrast unchanged
- All existing alt text preserved
