import { Home, ClipboardList, BarChart3, Settings, LogIn, Sparkles, UserCircle } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import logo from "@/assets/rest-easy-logo.png";

const navItems = [
  { title: "Home", url: "/dashboard", icon: Home },
  { title: "My Profile", url: "/profile", icon: UserCircle },
  { title: "Findability Score", url: "/assessment", icon: ClipboardList },
  { title: "Life Readiness", url: "/readiness", icon: Sparkles },
  { title: "Results", url: "/results", icon: BarChart3 },
];

const AppSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <img 
            src={logo} 
            alt="Rest Easy" 
            className={`transition-all duration-200 ${isCollapsed ? "h-8 w-8 object-contain" : "h-10 w-auto"}`}
          />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground font-body text-xs uppercase tracking-wider">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.url)}
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                    className={`font-body transition-all duration-200 ${
                      isActive(item.url) 
                        ? "bg-primary/10 text-primary hover:bg-primary/15 shadow-sm shadow-primary/5" 
                        : "hover:bg-accent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <item.icon className={`h-5 w-5 transition-transform duration-200 ${
                      isActive(item.url) ? "scale-110" : ""
                    }`} />
                    <span className={`transition-all duration-200 ${
                      isActive(item.url) ? "font-medium" : ""
                    }`}>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Score Preview Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground font-body text-xs uppercase tracking-wider">
            Your Progress
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className={`px-3 py-4 ${isCollapsed ? "hidden" : ""}`}>
              <div className="rounded-lg bg-gradient-to-br from-primary/5 to-accent/10 p-4 border border-primary/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Findability Score</span>
                  <span className="text-lg font-display font-bold text-primary">--</span>
                </div>
                <Progress value={0} className="h-2 bg-muted" />
                <p className="text-xs text-muted-foreground mt-3">
                  Complete an assessment to see your score
                </p>
              </div>
            </div>
            {isCollapsed && (
              <div className="flex justify-center py-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-primary" />
                </div>
              </div>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        <SidebarSeparator className="mb-3" />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => navigate("/menu")}
              isActive={isActive("/menu")}
              tooltip="Settings"
              className="hover:bg-accent"
            >
              <Settings className="h-5 w-5" />
              <span className="font-body">Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => navigate("/login")}
              tooltip="Sign In"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <LogIn className="h-5 w-5" />
              <span className="font-body font-medium">Sign In</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
