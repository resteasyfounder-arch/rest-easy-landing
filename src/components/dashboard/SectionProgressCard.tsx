import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, Lock, PlayCircle } from "lucide-react";
import type { SectionState, SectionStatus } from "@/types/assessment";

interface SectionProgressCardProps {
  section: SectionState;
  onClick?: () => void;
  className?: string;
}

const statusIcons: Record<SectionStatus, typeof Circle> = {
  locked: Lock,
  available: Circle,
  in_progress: PlayCircle,
  completed: CheckCircle2,
};

const statusColors: Record<SectionStatus, string> = {
  locked: "text-muted-foreground/50",
  available: "text-muted-foreground",
  in_progress: "text-primary",
  completed: "text-emerald-500",
};

export function SectionProgressCard({
  section,
  onClick,
  className,
}: SectionProgressCardProps) {
  const Icon = statusIcons[section.status];
  const isClickable = section.status !== "locked" && onClick;
  
  return (
    <button
      onClick={isClickable ? onClick : undefined}
      disabled={!isClickable}
      className={cn(
        "w-full text-left p-4 rounded-xl border transition-all duration-200",
        section.is_applicable 
          ? "bg-card border-border hover:border-primary/30 hover:shadow-soft"
          : "bg-muted/30 border-border/50 opacity-60",
        isClickable && "cursor-pointer",
        !isClickable && "cursor-default",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "mt-0.5 transition-colors",
          statusColors[section.status]
        )}>
          <Icon className="h-5 w-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-display font-medium text-foreground truncate">
              {section.label}
            </h3>
            {section.status === "completed" && (
              <span className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                {section.score}%
              </span>
            )}
          </div>
          
          <div className="mt-2 space-y-1.5">
            <Progress 
              value={section.progress} 
              className="h-1.5"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {section.questions_answered} of {section.questions_total} questions
              </span>
              <span>{Math.round(section.progress)}%</span>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

export default SectionProgressCard;
