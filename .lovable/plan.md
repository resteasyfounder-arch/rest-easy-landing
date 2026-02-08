

## Fix Hero Animations and Enlarge Pulsing Logo

### Problem
Two issues are preventing the hero from feeling animated:

1. **Fade-in never fires**: The `HeroAnimatedItem` wrapper relies on `IntersectionObserver` to detect when elements scroll into view. But the hero is at the very top of the page -- it is already visible when the observer attaches, so the transition from `opacity: 0` to `opacity: 1` may not trigger visibly (or fires before the browser paints). The elements start invisible and may stay that way or flash instantly.

2. **Logo too small to notice heartbeat**: The heart logo is only 64px / 80px. A 2% scale change on an 80px image is less than 2 pixels of movement -- virtually invisible.

### Solution

**File: `src/components/Hero.tsx`**

- **Enlarge the logo** from `w-16 h-16 lg:w-20 lg:h-20` to `w-24 h-24 lg:w-32 lg:h-32` (96px / 128px). This makes the heartbeat pulse clearly visible.
- **Fix the fade-in reliability**: Add an initial `useState(false)` that flips to `true` via `useEffect` on mount (with a short `requestAnimationFrame` or 50ms timeout). This guarantees the transition always plays on page load regardless of IntersectionObserver timing. Replace `useScrollAnimation` in `HeroAnimatedItem` with this mount-based trigger so the staggered reveal always fires.

**File: `src/index.css`**

- **Increase heartbeat intensity slightly**: Change the scale from `1.02` to `1.04` so the pulse is clearly visible even at a glance. Still subtle, but perceptible on a 128px logo.
- Shorten the heartbeat loop from 7s to 5s so it feels more alive.

### Technical Details

**HeroAnimatedItem change (Hero.tsx):**
```text
// Replace useScrollAnimation with a simple mount trigger
const [isVisible, setIsVisible] = useState(false);
useEffect(() => {
  const frame = requestAnimationFrame(() => setIsVisible(true));
  return () => cancelAnimationFrame(frame);
}, []);
```
This removes the IntersectionObserver dependency for the hero (which is always above the fold) and ensures the staggered fade-up always plays reliably on load.

**Logo size change (Hero.tsx):**
- Change: `w-16 h-16 lg:w-20 lg:h-20` to `w-24 h-24 lg:w-32 lg:h-32`

**Heartbeat keyframe change (index.css):**
- Change scale from `1.02` to `1.04`
- Change animation duration from `7s` to `5s`

### What stays the same
- All copy, CTAs, and links unchanged
- Background drift animations unchanged
- Button micro-interactions unchanged
- Reduced-motion media queries unchanged
- Trust indicators unchanged

