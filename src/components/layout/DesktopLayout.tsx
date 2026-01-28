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
          <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b border-border/40 bg-background/80 backdrop-blur-md px-8 transition-all">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="h-9 w-9 text-muted-foreground hover:text-primary transition-colors" />
              <div className="h-6 w-px bg-border/60" />
              <h1 className="font-display text-lg font-medium text-foreground/80 tracking-tight">
                {currentTitle}
              </h1>
            </div>
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
