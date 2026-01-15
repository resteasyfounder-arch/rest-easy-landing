import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

type FlowPhase = "intro" | "profile" | "profile-review" | "assessment" | "complete";

interface ReadinessProgressProps {
  phase: FlowPhase;
  profileProgress: number; // 0-100
  assessmentProgress: number; // 0-100
}

const ReadinessProgress = ({
  phase,
  profileProgress,
  assessmentProgress,
}: ReadinessProgressProps) => {
  const isProfileComplete = phase === "profile-review" || phase === "assessment" || phase === "complete";
  const isAssessmentComplete = phase === "complete";

  return (
    <div className="px-4 py-3">
      {/* Phase Indicators */}
      <div className="flex items-center justify-between mb-3">
        {/* Profile Phase */}
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors",
              isProfileComplete
                ? "bg-primary text-primary-foreground"
                : phase === "profile" || phase === "intro"
                ? "bg-primary/20 text-primary border-2 border-primary"
                : "bg-muted text-muted-foreground"
            )}
          >
            {isProfileComplete ? <Check className="w-3.5 h-3.5" /> : "1"}
          </div>
          <span
            className={cn(
              "font-body text-xs transition-colors",
              phase === "profile" || phase === "intro" || isProfileComplete
                ? "text-foreground font-medium"
                : "text-muted-foreground"
            )}
          >
            Profile
          </span>
        </div>

        {/* Connector Line */}
        <div className="flex-1 mx-3">
          <div className="h-0.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500 ease-out"
              style={{
                width: isProfileComplete ? "100%" : `${profileProgress}%`,
              }}
            />
          </div>
        </div>

        {/* Assessment Phase */}
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors",
              isAssessmentComplete
                ? "bg-primary text-primary-foreground"
                : phase === "assessment"
                ? "bg-primary/20 text-primary border-2 border-primary"
                : "bg-muted text-muted-foreground"
            )}
          >
            {isAssessmentComplete ? <Check className="w-3.5 h-3.5" /> : "2"}
          </div>
          <span
            className={cn(
              "font-body text-xs transition-colors",
              phase === "assessment" || isAssessmentComplete
                ? "text-foreground font-medium"
                : "text-muted-foreground"
            )}
          >
            Assessment
          </span>
        </div>
      </div>

      {/* Current Phase Progress Bar */}
      {(phase === "profile" || phase === "assessment") && (
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
            style={{
              width: `${phase === "profile" ? profileProgress : assessmentProgress}%`,
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ReadinessProgress;
