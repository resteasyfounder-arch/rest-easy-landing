import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import BottomNav from "./BottomNav";
import DesktopLayout from "./DesktopLayout";
import { useIsMobile } from "@/hooks/use-mobile";

interface AppLayoutProps {
  children: ReactNode;
  hideNav?: boolean;
}

// Routes that should show the navigation (inner app pages)
const APP_ROUTES = ["/profile", "/assessment", "/readiness", "/results", "/menu", "/dashboard", "/vault"];

const AppLayout = ({ children, hideNav = false }: AppLayoutProps) => {
  const isMobile = useIsMobile();
  const location = useLocation();
  
  // Check if we're on an inner app page (not landing page)
  const isAppRoute = APP_ROUTES.some(route => location.pathname.startsWith(route));
  
  // Show navigation on app routes unless explicitly hidden
  const showNav = isAppRoute && !hideNav;

  // Desktop with navigation: Use sidebar layout
  if (!isMobile && showNav) {
    return <DesktopLayout>{children}</DesktopLayout>;
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
