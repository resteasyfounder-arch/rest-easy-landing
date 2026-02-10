import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import AppSidebar from "./AppSidebar";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface DesktopLayoutProps {
  children: ReactNode;
  onStartTour?: () => void;
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

const DesktopLayout = ({ children, onStartTour }: DesktopLayoutProps) => {
  const location = useLocation();
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
            {onStartTour && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={onStartTour} className="h-8 w-8 text-muted-foreground hover:text-foreground">
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Feature Tour</TooltipContent>
              </Tooltip>
            )}
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
