import { Home, BarChart3, LogIn, Sparkles, UserCircle, Vault, FileText } from "lucide-react";
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
import { useAssessmentState } from "@/hooks/useAssessmentState";
import { useVaultDocuments } from "@/hooks/useVaultDocuments";
import { totalDocumentCount } from "@/data/vaultDocuments";
import { TierBadge } from "@/components/dashboard";
import logo from "@/assets/rest-easy-logo.png";

const navItems = [
  { title: "Home", url: "/dashboard", icon: Home, tourId: "home" },
  { title: "My Profile", url: "/profile", icon: UserCircle, tourId: "profile" },
  { title: "Life Readiness", url: "/readiness", icon: Sparkles, tourId: "readiness" },
  { title: "Readiness Report", url: "/results", icon: BarChart3, tourId: "report" },
  { title: "EasyVault", url: "/vault", icon: Vault, tourId: "vault" },
];

const AppSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const { assessmentState, hasStarted, isComplete } = useAssessmentState();
  const { documents, excludedDocIds } = useVaultDocuments();

  const applicableSections = assessmentState.sections.filter((s) => s.is_applicable);
  const completedSectionsCount = applicableSections.filter((s) => s.progress === 100).length;
  const totalSections = applicableSections.length;

  // Vault progress
  const savedTypeIds = new Set(documents.map((d) => d.document_type_id));
  const vaultCompleted = [...savedTypeIds].filter((id) => !excludedDocIds.has(id)).length;
  const vaultApplicable = totalDocumentCount - excludedDocIds.size;
  const vaultPercentage = vaultApplicable > 0 ? Math.round((vaultCompleted / vaultApplicable) * 100) : 0;

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
                    data-tour={item.tourId}
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

        {/* Life Readiness Progress */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground font-body text-xs uppercase tracking-wider">
            Life Readiness Progress
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className={`px-3 py-4 ${isCollapsed ? "hidden" : ""}`}>
              <div className="rounded-lg bg-gradient-to-br from-primary/5 to-accent/10 p-4 border border-primary/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">
                    {isComplete ? "Readiness Score" : "Progress"}
                  </span>
                  <span className="text-lg font-display font-bold text-primary">
                    {isComplete 
                      ? assessmentState.overall_score 
                      : hasStarted 
                        ? `${Math.round(assessmentState.overall_progress)}%` 
                        : "--"}
                  </span>
                </div>
                <Progress value={assessmentState.overall_progress} className="h-2 bg-muted" />
                {isComplete ? (
                  <div className="mt-3">
                    <TierBadge tier={assessmentState.tier} size="sm" />
                  </div>
                ) : hasStarted ? (
                  <p className="text-xs text-muted-foreground mt-3">
                    {completedSectionsCount} of {totalSections} sections done
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-3">
                    Complete an assessment to see your score
                  </p>
                )}
              </div>
            </div>
            {isCollapsed && (
              <div className="flex justify-center py-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">
                    {isComplete 
                      ? assessmentState.overall_score 
                      : hasStarted 
                        ? `${Math.round(assessmentState.overall_progress)}%` 
                        : "--"}
                  </span>
                </div>
              </div>
            )}
          </SidebarGroupContent>
        </SidebarGroup>

        {/* EasyVault Progress */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground font-body text-xs uppercase tracking-wider">
            EasyVault Progress
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className={`px-3 py-4 ${isCollapsed ? "hidden" : ""}`}>
              <div className="rounded-lg bg-gradient-to-br from-primary/5 to-accent/10 p-4 border border-primary/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Documents</span>
                  <span className="text-lg font-display font-bold text-primary">
                    {vaultCompleted}/{vaultApplicable}
                  </span>
                </div>
                <Progress value={vaultPercentage} className="h-2 bg-muted" />
                <p className="text-xs text-muted-foreground mt-3">
                  {vaultPercentage}% complete
                </p>
              </div>
            </div>
            {isCollapsed && (
              <div className="flex justify-center py-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-primary" />
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
