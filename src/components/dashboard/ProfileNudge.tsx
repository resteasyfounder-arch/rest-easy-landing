import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Lightbulb, ArrowRight } from "lucide-react";

interface ProfileNudgeProps {
  lockedSectionsCount?: number;
  additionalQuestionsCount?: number;
  onComplete: () => void;
  className?: string;
}

const ProfileNudge = ({
  lockedSectionsCount = 0,
  additionalQuestionsCount = 0,
  onComplete,
  className,
}: ProfileNudgeProps) => {
  // Build unlock message
  const getUnlockMessage = () => {
    const parts = [];
    if (lockedSectionsCount > 0) {
      parts.push(`${lockedSectionsCount} section${lockedSectionsCount > 1 ? "s" : ""}`);
    }
    if (additionalQuestionsCount > 0) {
      parts.push(`${additionalQuestionsCount} personalized question${additionalQuestionsCount > 1 ? "s" : ""}`);
    }
    if (parts.length === 0) {
      return "personalized questions";
    }
    return parts.join(" and ");
  };

  return (
    <div className={cn(
      "flex items-start gap-3 p-4 rounded-xl bg-amber-50/50 border border-amber-200/50",
      "dark:bg-amber-950/20 dark:border-amber-800/30",
      className
    )}>
      <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center flex-shrink-0">
        <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground">
          <span className="font-medium">Quick tip:</span>{" "}
          Complete your profile to unlock {getUnlockMessage()}
        </p>
        
        <Button
          variant="link"
          size="sm"
          onClick={onComplete}
          className="h-auto p-0 mt-1 text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300"
        >
          Complete Profile
          <ArrowRight className="h-3.5 w-3.5 ml-1" />
        </Button>
      </div>
    </div>
  );
};

export default ProfileNudge;
