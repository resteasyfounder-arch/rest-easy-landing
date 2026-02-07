import { Home, BarChart3, UserCircle, Sparkles, Vault } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Home", path: "/dashboard" },
  { icon: Sparkles, label: "Readiness", path: "/readiness" },
  { icon: Vault, label: "Vault", path: "/vault" },
  { icon: BarChart3, label: "Report", path: "/results" },
  { icon: UserCircle, label: "Profile", path: "/profile" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-nav safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 px-4 py-2 min-w-[64px] touch-target press-effect transition-all duration-200",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {/* Active indicator pill */}
              <div className={cn(
                "absolute -top-1 left-1/2 -translate-x-1/2 h-1 rounded-full bg-primary transition-all duration-300 ease-out",
                isActive ? "w-8 opacity-100" : "w-0 opacity-0"
              )} />
              
              <Icon className={cn(
                "h-5 w-5 transition-all duration-200",
                isActive && "stroke-[2.5] scale-110"
              )} />
              <span className={cn(
                "text-xs font-body transition-all duration-200",
                isActive ? "font-semibold" : "font-medium"
              )}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
