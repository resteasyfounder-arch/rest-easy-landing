import { ReactNode } from "react";
import BottomNav from "./BottomNav";
import DesktopLayout from "./DesktopLayout";
import { useIsMobile } from "@/hooks/use-mobile";

interface AppLayoutProps {
  children: ReactNode;
  hideBottomNav?: boolean;
  isAuthenticated?: boolean;
}

const AppLayout = ({ children, hideBottomNav = false, isAuthenticated = false }: AppLayoutProps) => {
  const isMobile = useIsMobile();
  
  // Authenticated desktop users: Use sidebar layout
  if (!isMobile && isAuthenticated) {
    return <DesktopLayout>{children}</DesktopLayout>;
  }

  // Unauthenticated desktop users: No sidebar, just content with top padding for header
  if (!isMobile && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background pt-16">
        {children}
      </div>
    );
  }

  // Mobile: Use bottom navigation
  const showBottomNav = !hideBottomNav;

  return (
    <div className="min-h-screen bg-background">
      <main className={showBottomNav ? "pb-20 pt-14" : "pt-14"}>
        {children}
      </main>
      {showBottomNav && <BottomNav />}
    </div>
  );
};

export default AppLayout;
