import { useState, useEffect, useCallback, useRef } from "react";

const SCROLL_THRESHOLD = 300;
const TARGET_LINE = 0.2; // 20% from top of viewport

export function useActiveSection(sectionIds: string[]) {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const overrideRef = useRef<string | null>(null);
  const rafRef = useRef<number | null>(null);

  const setOverride = useCallback((id: string | null) => {
    overrideRef.current = id;
    if (id) setActiveSection(id);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;

        // Clear override once scroll settles
        if (overrideRef.current) {
          overrideRef.current = null;
        }

        if (window.scrollY < SCROLL_THRESHOLD) {
          setActiveSection(null);
          return;
        }

        const targetY = window.innerHeight * TARGET_LINE;
        let closest: string | null = null;
        let closestDist = Infinity;

        for (const id of sectionIds) {
          const el = document.getElementById(id);
          if (!el) continue;
          const rect = el.getBoundingClientRect();
          // Section top must be at or above the target line
          if (rect.top <= targetY) {
            const dist = targetY - rect.top;
            if (dist < closestDist) {
              closestDist = dist;
              closest = id;
            }
          }
        }

        if (closest) {
          setActiveSection(closest);
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [sectionIds]);

  return { activeSection, setOverride };
}
