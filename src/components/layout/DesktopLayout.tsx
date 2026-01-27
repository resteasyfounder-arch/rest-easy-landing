import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import AppSidebar from "./AppSidebar";
import { useNavigate } from "react-router-dom";

interface DesktopLayoutProps {
  children: ReactNode;
}

const routeTitles: Record<string, string> = {
  "/": "Home",
  "/assessment": "Findability Score",
  "/readiness": "Life Readiness",
  "/results": "Your Results",
  "/menu": "Settings",
  "/login": "Sign In",
  "/profile": "My Profile",
};

const DesktopLayout = ({ children }: DesktopLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentTitle = routeTitles[location.pathname] || "Rest Easy";

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          {/* Contextual Header */}
          <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-4 border-b border-border/50 bg-background/80 backdrop-blur-md px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="h-8 w-8" />
              <div className="h-4 w-px bg-border" />
              <h1 className="font-body text-sm font-medium text-muted-foreground">
                {currentTitle}
              </h1>
            </div>
            {/* Intentionally empty - auth actions handled by sidebar */}
          </header>

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default DesktopLayout;
