import { cn } from "@/lib/utils";
import { Check, Lock, Circle, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

export type JourneyNodeStatus = "completed" | "current" | "available" | "locked";

interface JourneyNodeProps {
  label: string;
  status: JourneyNodeStatus;
  progress?: number;
  questionsAnswered?: number;
  questionsTotal?: number;
  score?: number;
  completionMessage?: string;
  onContinue?: () => void;
  onClick?: () => void;
  isLast?: boolean;
  className?: string;
}

const statusConfig = {
  completed: {
    icon: Check,
    nodeClass: "bg-primary text-primary-foreground",
    lineClass: "bg-primary",
    labelClass: "text-foreground",
  },
  current: {
    icon: Circle,
    nodeClass: "bg-primary text-primary-foreground animate-journey-pulse",
    lineClass: "bg-gradient-to-b from-primary to-border",
    labelClass: "text-foreground font-medium",
  },
  available: {
    icon: Circle,
    nodeClass: "bg-muted text-muted-foreground border-2 border-border",
    lineClass: "border-l-2 border-dashed border-muted-foreground/30",
    labelClass: "text-muted-foreground",
  },
  locked: {
    icon: Lock,
    nodeClass: "bg-muted/50 text-muted-foreground/50 border-2 border-dashed border-border",
    lineClass: "border-l-2 border-dashed border-muted-foreground/20",
    labelClass: "text-muted-foreground/60",
  },
};

const JourneyNode = ({
  label,
  status,
  progress = 0,
  questionsAnswered = 0,
  questionsTotal = 0,
  score,
  completionMessage,
  onContinue,
  onClick,
  isLast = false,
  className,
}: JourneyNodeProps) => {
  const config = statusConfig[status];
  const Icon = config.icon;
  const isClickable = status !== "locked" && onClick;

  return (
    <div className={cn("relative flex gap-4", className)}>
      {/* Timeline connector */}
      <div className="flex flex-col items-center">
        {/* Node circle */}
        <button
          onClick={isClickable ? onClick : undefined}
          disabled={!isClickable}
          className={cn(
            "relative z-10 flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300",
            config.nodeClass,
            isClickable && "cursor-pointer hover:scale-110",
            !isClickable && "cursor-default"
          )}
        >
          {status === "completed" ? (
            <Check className="w-5 h-5 animate-check-pop" />
          ) : status === "current" ? (
            <>
              <Play className="w-4 h-4 fill-current" />
              <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping-slow" />
            </>
          ) : (
            <Icon className="w-4 h-4" />
          )}
        </button>

        {/* Connecting line */}
        {!isLast && (
          <div className={cn(
            "w-0.5 flex-1 min-h-[40px]",
            status === "completed" ? config.lineClass : "",
            status === "current" && "bg-gradient-to-b from-primary to-border",
            (status === "available" || status === "locked") && config.lineClass
          )} />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-6 min-w-0">
        <div 
          className={cn(
            "transition-all duration-200",
            status === "current" && "bg-primary/5 -mx-3 px-3 py-3 rounded-xl border border-primary/20"
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className={cn(
                "font-display text-base truncate",
                config.labelClass
              )}>
                {label}
              </h3>
              
              {/* Status text */}
              {status === "completed" && (
                <p className="text-sm text-primary mt-0.5">
                  {completionMessage || "Complete"}
                  {score !== undefined && ` · Score: ${score}`}
                </p>
              )}
              
              {status === "current" && questionsTotal > 0 && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-primary/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {questionsAnswered}/{questionsTotal}
                    </span>
                  </div>
                </div>
              )}
              
              {status === "available" && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  Ready to start
                </p>
              )}
              
              {status === "locked" && (
                <p className="text-sm text-muted-foreground/60 mt-0.5">
                  Complete profile to unlock
                </p>
              )}
            </div>

            {/* Score badge for completed */}
            {status === "completed" && score !== undefined && (
              <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full whitespace-nowrap">
                {score}%
              </span>
            )}
          </div>

          {/* Embedded CTA for current section */}
          {status === "current" && onContinue && (
            <Button
              onClick={onContinue}
              size="sm"
              className="mt-3 gap-1.5 shadow-soft"
            >
              <Play className="h-3.5 w-3.5" />
              Continue where you left off
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default JourneyNode;
