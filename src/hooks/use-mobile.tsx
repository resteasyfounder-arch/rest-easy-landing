import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    // Initialize with actual value if window is available
    if (typeof window !== "undefined") {
      return window.innerWidth < MOBILE_BREAKPOINT;
    }
    return false; // Default to desktop for SSR
  });

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    
    // Check immediately on mount
    checkMobile();
    
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    mql.addEventListener("change", checkMobile);
    
    // Also listen to resize for more reliable detection
    window.addEventListener("resize", checkMobile);
    
    return () => {
      mql.removeEventListener("change", checkMobile);
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  return isMobile;
}
