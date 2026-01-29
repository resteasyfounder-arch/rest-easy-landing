

## Floating Life Area Icons for Hero Banner

This enhancement will add animated floating icons representing the different life areas (Legal, Financial, Healthcare, Digital, Family) that orbit around the heart logo, creating an engaging and dynamic first impression.

---

### Visual Concept

The heart logo will become the center of an orbital system where 5 life area icons float in a circular arrangement around it. Each icon will have:
- Staggered floating animations (gentle up/down movement)
- Subtle opacity variations
- A soft glow effect
- Responsive sizing (smaller on mobile, larger on desktop)

---

### Implementation Steps

**1. Create FloatingIcons Component**

A new component `src/components/landing/FloatingIcons.tsx` that:
- Defines the 5 life area icons with their positions on an orbital path
- Uses CSS transforms and absolute positioning to place icons in a circle
- Applies staggered floating animations using existing `animate-float-gentle` class
- Includes subtle connecting lines or dots between icons (optional orbital path)

**2. Update Hero Component**

Modify `src/components/Hero.tsx` to:
- Import and wrap the heart logo with the FloatingIcons component
- Ensure proper z-indexing so icons appear behind/around the logo
- Maintain responsive behavior (simpler animation on mobile)

**3. Add New CSS Animations**

Extend `src/index.css` with:
- `@keyframes orbit-float` - A combined orbit + float animation
- Utility classes for staggered orbit positions
- Subtle glow/pulse effects for the floating icons

---

### Technical Details

**Icon Configuration:**
```text
+---------------------+
|   Scale (Legal)     |
|        \            |
|  Key ----[HEART]---- Heart   
| (Digital)  |      (Healthcare)
|        /            |
|    Wallet   Users   |
| (Financial) (Family)|
+---------------------+
```

**Animation Approach:**
- Each icon positioned using `transform: rotate(X deg) translateX(radius) rotate(-X deg)`
- Individual floating animation with staggered delays (0s, 0.5s, 1s, 1.5s, 2s)
- GPU-accelerated with `will-change: transform`
- Respects `prefers-reduced-motion` for accessibility

**Responsive Behavior:**
- Mobile: Icons in a tighter circle (80px radius), smaller size (w-8 h-8)
- Desktop: Larger circle (120px radius), bigger icons (w-10 h-10)
- Optional: Hide some icons on very small screens

---

### Files to Create/Modify

| File | Action |
|------|--------|
| `src/components/landing/FloatingIcons.tsx` | Create new component |
| `src/components/Hero.tsx` | Integrate FloatingIcons around heart logo |
| `src/index.css` | Add orbit animation keyframes |

---

### Accessibility Considerations

- All animations will check for `prefers-reduced-motion`
- Icons are decorative only (no interactive function)
- Core content remains fully accessible without animations

