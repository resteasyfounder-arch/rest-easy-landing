import { ReactNode, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import BottomNav from "./BottomNav";
import DesktopLayout from "./DesktopLayout";
import { useIsMobile } from "@/hooks/use-mobile";
import FeatureTour from "@/components/tour/FeatureTour";
import { useFeatureTour } from "@/hooks/useFeatureTour";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface AppLayoutProps {
  children: ReactNode;
  hideNav?: boolean;
}

// Routes that should show the navigation (inner app pages)
const APP_ROUTES = ["/profile", "/assessment", "/readiness", "/results", "/menu", "/dashboard", "/vault"];

const AppLayout = ({ children, hideNav = false }: AppLayoutProps) => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const tourHook = useFeatureTour();
  const autoStarted = useRef(false);
  
  // Check if we're on an inner app page (not landing page)
  const isAppRoute = APP_ROUTES.some(route => location.pathname.startsWith(route));
  
  // Show navigation on app routes unless explicitly hidden
  const showNav = isAppRoute && !hideNav;

  // Auto-start tour on first visit to an app route
  useEffect(() => {
    if (showNav && !tourHook.hasCompleted && !autoStarted.current) {
      autoStarted.current = true;
      const timer = setTimeout(() => tourHook.start(), 500);
      return () => clearTimeout(timer);
    }
  }, [showNav, tourHook.hasCompleted]);

  // Desktop with navigation: Use sidebar layout
  if (!isMobile && showNav) {
    return (
      <>
        <DesktopLayout onStartTour={tourHook.start}>{children}</DesktopLayout>
        <FeatureTour tourHook={tourHook} />
      </>
    );
  }

  // Desktop without navigation (landing page): Just content
  if (!isMobile && !showNav) {
    return (
      <div className="min-h-screen bg-background">
        {children}
      </div>
    );
  }

  // Mobile with navigation: Use bottom nav
  if (showNav) {
    return (
      <div className="min-h-screen bg-background">
        <main className="pb-20">
          {children}
        </main>
        <BottomNav />
        {/* Mobile tour re-trigger button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              onClick={tourHook.start}
              className="fixed bottom-20 right-4 z-40 h-10 w-10 rounded-full shadow-md"
            >
              <HelpCircle className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">Feature Tour</TooltipContent>
        </Tooltip>
        <FeatureTour tourHook={tourHook} />
      </div>
    );
  }

  // Mobile without navigation (landing page)
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
};

export default AppLayout;
