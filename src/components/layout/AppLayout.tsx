import { ReactNode } from "react";
import BottomNav from "./BottomNav";
import DesktopLayout from "./DesktopLayout";
import { useIsMobile } from "@/hooks/use-mobile";

interface AppLayoutProps {
  children: ReactNode;
  hideBottomNav?: boolean;
}

const AppLayout = ({ children, hideBottomNav = false }: AppLayoutProps) => {
  const isMobile = useIsMobile();
  
  // Desktop: Use sidebar layout
  if (!isMobile) {
    return <DesktopLayout>{children}</DesktopLayout>;
  }

  // Mobile: Use bottom navigation
  const showBottomNav = !hideBottomNav;

  return (
    <div className="min-h-screen bg-background">
      <main className={showBottomNav ? "pb-20" : ""}>
        {children}
      </main>
      {showBottomNav && <BottomNav />}
    </div>
  );
};

export default AppLayout;
