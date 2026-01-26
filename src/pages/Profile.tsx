import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAssessmentState } from "@/hooks/useAssessmentState";
import {
  UserCircle,
  Heart,
  Users,
  Home,
  Briefcase,
  Laptop,
  HandHeart,
  Flower2,
  PiggyBank,
  ArrowRight,
  Loader2,
} from "lucide-react";

import { cn } from "@/lib/utils";

// Profile items for the visual snapshot - simplified view only
const SNAPSHOT_ITEMS = [
  { id: "family", label: "Family", icon: Users },
  { id: "pets", label: "Pets", icon: Heart },
  { id: "caregiving", label: "Caregiving", icon: HandHeart },
  { id: "home", label: "Home", icon: Home },
  { id: "belongings", label: "Belongings", icon: Briefcase },
  { id: "finances", label: "Finances", icon: PiggyBank },
  { id: "digital", label: "Digital", icon: Laptop },
  { id: "faith", label: "Faith", icon: Flower2 },
];

// Visual snapshot component - read-only display
const LifeSnapshot = ({ profileComplete }: { profileComplete: boolean }) => {
  return (
    <div className="relative w-full max-w-sm mx-auto aspect-square">
      {/* Central avatar */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border-2 border-primary/30 flex items-center justify-center shadow-lg shadow-primary/10">
          <UserCircle className="w-10 h-10 text-primary" />
        </div>
      </div>

      {/* Connection lines (decorative) */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
            <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        <circle 
          cx="50" 
          cy="50" 
          r="35" 
          fill="none" 
          stroke="url(#lineGradient)" 
          strokeWidth="0.5"
          strokeDasharray="2 4"
        />
      </svg>

      {/* Snapshot items arranged around center */}
      {SNAPSHOT_ITEMS.map((item, index) => {
        const Icon = item.icon;
        const isActive = profileComplete;
        
        // Calculate position around the circle
        const angle = (index / SNAPSHOT_ITEMS.length) * 2 * Math.PI - Math.PI / 2;
        const radius = 38;
        const x = 50 + radius * Math.cos(angle);
        const y = 50 + radius * Math.sin(angle);

        return (
          <div
            key={item.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-500"
            style={{
              left: `${x}%`,
              top: `${y}%`,
            }}
          >
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300",
                  isActive && [
                    "bg-primary/15 border-2 border-primary/30 shadow-md shadow-primary/10",
                  ],
                  !isActive && [
                    "bg-muted/20 border border-dashed border-border/20",
                  ],
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 transition-all duration-300",
                    isActive && "text-primary",
                    !isActive && "text-muted-foreground/30",
                  )}
                />
              </div>
              <span
                className={cn(
                  "text-xs font-body transition-all duration-300 text-center",
                  isActive && "text-foreground font-medium",
                  !isActive && "text-muted-foreground/40",
                )}
              >
                {item.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const Profile = () => {
  const navigate = useNavigate();
  const { assessmentState, isLoading } = useAssessmentState();

  const { profile_complete, profile_progress, status } = assessmentState;
  const hasStarted = status !== "not_started";

  const handleStartReadiness = () => {
    navigate("/readiness");
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background">
        <div className="max-w-xl mx-auto px-6 py-10 pb-32">
          {/* Header */}
          <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-2xl font-display font-bold text-foreground mb-2">
              Your Life, At a Glance
            </h1>
            <p className="text-muted-foreground font-body text-sm leading-relaxed max-w-xs mx-auto">
              A snapshot of what matters in your world
            </p>
          </div>

          {/* Empty State - Not started */}
          {!hasStarted && (
            <Card className="p-8 text-center bg-card/60 backdrop-blur-sm border-border/40 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
              <div className="space-y-5">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto">
                  <UserCircle className="w-10 h-10 text-primary" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-lg font-display font-semibold text-foreground">
                    Welcome! Let's create your snapshot
                  </h2>
                  <p className="text-foreground/80 font-body text-base leading-relaxed max-w-sm mx-auto">
                    A few quick questions help us understand what matters most in your life — 
                    no right or wrong answers.
                  </p>
                  <p className="text-sm text-muted-foreground font-body">
                    About 1 minute · You can always update later
                  </p>
                </div>
                <Button
                  onClick={handleStartReadiness}
                  size="lg"
                  className="mt-2 gap-2 font-body"
                >
                  Let's Begin
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          )}

          {/* Profile Content - Has started */}
          {hasStarted && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
              
              {/* Life Snapshot Visual Card */}
              <Card className="p-6 pt-8 bg-card/60 backdrop-blur-sm border-border/40 overflow-hidden">
                <LifeSnapshot profileComplete={profile_complete} />
                
                {/* Progress indicator */}
                <div className="text-center mt-6 pt-6 border-t border-border/30">
                  {profile_complete ? (
                    <p className="text-base font-body text-foreground/80 leading-relaxed">
                      Your profile is complete. You can review or update your answers anytime.
                    </p>
                  ) : (
                    <p className="text-base font-body text-muted-foreground leading-relaxed">
                      Profile {Math.round(profile_progress)}% complete
                    </p>
                  )}
                </div>
              </Card>

              {/* Continue CTA */}
              <div className="text-center space-y-4 pt-4">
                <p className="text-foreground font-body text-base leading-relaxed">
                  {profile_complete 
                    ? "Whenever you're ready, continue your assessment."
                    : "Continue to complete your profile."
                  }
                </p>
                <Button
                  onClick={handleStartReadiness}
                  size="lg"
                  className="gap-2 font-body"
                >
                  {profile_complete ? "Continue Assessment" : "Complete Profile"}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Profile;
