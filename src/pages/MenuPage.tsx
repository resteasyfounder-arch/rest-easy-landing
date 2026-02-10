import { useNavigate } from "react-router-dom";
import { User, Settings, HelpCircle, FileText, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/layout/AppLayout";
import { useRemySurface } from "@/hooks/useRemySurface";
import { RemyInlineNudge } from "@/components/remy/RemyInlineNudge";
import { useAuth } from "@/context/AuthContext";

const menuItems = [
  { icon: User, label: "Account", description: "Manage your profile" },
  { icon: Settings, label: "Settings", description: "App preferences" },
  { icon: FileText, label: "My Documents", description: "View saved documents" },
  { icon: HelpCircle, label: "Help & Support", description: "Get assistance" },
];

const MenuPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const {
    payload: remyPayload,
    isLoading: isLoadingRemy,
    error: remyError,
    dismissNudge,
    acknowledgeAction,
  } = useRemySurface({
    subjectId: null,
    surface: "menu",
    enabled: true,
  });

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (_err) {
      // no-op: keep user on page if logout fails
    }
  };

  return (
    <AppLayout>
      <div className="px-4 py-8">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-display font-semibold text-foreground mb-6">
            Menu
          </h1>

          <RemyInlineNudge
            payload={remyPayload}
            isLoading={isLoadingRemy}
            error={remyError}
            onDismiss={(nudgeId) => dismissNudge(nudgeId, 24)}
            onAcknowledge={acknowledgeAction}
            className="mb-5"
          />
          
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.label}
                  variant="ghost"
                  className="w-full h-auto py-4 px-4 justify-start gap-4 press-effect"
                >
                  <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <div className="font-body font-medium">{item.label}</div>
                    <div className="text-sm text-muted-foreground font-body">
                      {item.description}
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>

          <div className="mt-8 pt-8 border-t border-border">
            <Button
              variant="ghost"
              className="w-full justify-start gap-4 text-destructive hover:text-destructive hover:bg-destructive/10 press-effect"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              <span className="font-body">Sign Out</span>
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default MenuPage;
