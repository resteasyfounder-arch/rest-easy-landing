import { ReactNode } from "react";
import BottomNav from "./BottomNav";
import { useIsMobile } from "@/hooks/use-mobile";

interface AppLayoutProps {
  children: ReactNode;
  hideBottomNav?: boolean;
}

const AppLayout = ({ children, hideBottomNav = false }: AppLayoutProps) => {
  const isMobile = useIsMobile();
  const showBottomNav = isMobile && !hideBottomNav;

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
