import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Compass, ChevronRight, AlertCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ImmediateAction, ActionItem } from "@/types/report";

type ActionItemType = ImmediateAction | ActionItem;

interface QuickActionsCardProps {
  actions: ActionItemType[];
  maxItems?: number;
  onViewAll?: () => void;
  className?: string;
}

function isPriorityAction(action: ActionItemType): action is ActionItem {
  return "priority" in action && typeof action.priority === "string";
}

function getPriorityFromAction(action: ActionItemType): "HIGH" | "MEDIUM" | "LOW" {
  if (isPriorityAction(action)) {
    return action.priority;
  }
  // ImmediateAction uses numeric priority (1-3)
  const numPriority = (action as ImmediateAction).priority;
  if (numPriority === 1) return "HIGH";
  if (numPriority === 2) return "MEDIUM";
  return "LOW";
}

function PriorityBadge({ priority }: { priority: "HIGH" | "MEDIUM" | "LOW" }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
      priority === "HIGH" && "bg-rose-500/10 text-rose-600 dark:text-rose-400",
      priority === "MEDIUM" && "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      priority === "LOW" && "bg-muted text-muted-foreground"
    )}>
      {priority === "HIGH" && <AlertCircle className="h-3 w-3" />}
      {priority === "MEDIUM" && <AlertTriangle className="h-3 w-3" />}
      {priority}
    </span>
  );
}

export function QuickActionsCard({
  actions,
  maxItems = 3,
  onViewAll,
  className,
}: QuickActionsCardProps) {
  const displayActions = actions.slice(0, maxItems);

  if (displayActions.length === 0) {
    return null;
  }

  return (
    <Card className={cn("border-border/50", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="h-5 w-5 text-primary" />
            <CardTitle className="font-display text-lg">Recommended Next Steps</CardTitle>
          </div>
          {onViewAll && actions.length > maxItems && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onViewAll}
              className="text-muted-foreground hover:text-foreground gap-1"
            >
              View All
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {displayActions.map((action, index) => {
          const priority = getPriorityFromAction(action);
          return (
            <div
              key={index}
              className="p-3 rounded-lg bg-muted/30 border border-border/50 space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-medium text-foreground text-sm leading-snug">
                  {action.title}
                </h4>
                <PriorityBadge priority={priority} />
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {action.description}
              </p>
            </div>
          );
        })}
        
        {onViewAll && (
          <Button
            variant="outline"
            size="sm"
            onClick={onViewAll}
            className="w-full mt-2"
          >
            View Full Action Plan
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default QuickActionsCard;
