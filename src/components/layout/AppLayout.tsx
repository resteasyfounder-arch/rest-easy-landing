import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import BottomNav from "./BottomNav";
import DesktopLayout from "./DesktopLayout";
import { useIsMobile } from "@/hooks/use-mobile";
import { Atmosphere } from "@/components/ui/Atmosphere";
import { GrainOverlay } from "@/components/ui/GrainOverlay";

interface AppLayoutProps {
  children: ReactNode;
  hideNav?: boolean;
}

// Routes that should show the navigation (inner app pages)
const APP_ROUTES = ["/profile", "/assessment", "/readiness", "/results", "/menu", "/dashboard"];

const AppLayout = ({ children, hideNav = false }: AppLayoutProps) => {
  const isMobile = useIsMobile();
  const location = useLocation();

  // Check if we're on an inner app page (not landing page)
  const isAppRoute = APP_ROUTES.some(route => location.pathname.startsWith(route));

  // Show navigation on app routes unless explicitly hidden
  const showNav = isAppRoute && !hideNav;

  return (
    <div className="min-h-screen bg-background relative font-sans selection:bg-primary/20 selection:text-foreground overflow-x-hidden">
      {/* Visual Foundation */}
      <Atmosphere />
      <GrainOverlay />

      {/* Desktop with navigation: Use sidebar layout */}
      {!isMobile && showNav && (
        <DesktopLayout>{children}</DesktopLayout>
      )}

      {/* Desktop without navigation (landing page): Just content */}
      {!isMobile && !showNav && (
        <div className="min-h-screen relative z-10">
          {children}
        </div>
      )}

      {/* Mobile with navigation: Use bottom nav */}
      {isMobile && showNav && (
        <div className="min-h-screen relative z-10">
          <main className="pb-20">
            {children}
          </main>
          <BottomNav />
        </div>
      )}

      {/* Mobile without navigation (landing page) */}
      {isMobile && !showNav && (
        <div className="min-h-screen relative z-10">
          {children}
        </div>
      )}
    </div>
  );
};

export default AppLayout;
