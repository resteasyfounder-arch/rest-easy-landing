import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, Clock, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ActionItem } from "@/types/report";

interface ActionPlanProps {
  actions: ActionItem[];
}

const priorityColors = {
  HIGH: "bg-red-500/20 text-red-700 border-red-500/30",
  MEDIUM: "bg-amber-500/20 text-amber-700 border-amber-500/30",
  LOW: "bg-green-500/20 text-green-700 border-green-500/30",
};

const ActionPlan = ({ actions }: ActionPlanProps) => {
  // Sort by priority: HIGH first, then MEDIUM, then LOW
  const sortedActions = [...actions].sort((a, b) => {
    const order = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    return order[a.priority] - order[b.priority];
  });

  return (
    <Card className="border-primary/20 bg-card shadow-soft">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <ClipboardList className="h-5 w-5 text-primary" />
          Your Action Plan
        </CardTitle>
        <p className="text-sm text-muted-foreground font-body">
          Step-by-step guide to improving your readiness
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedActions.map((action, index) => (
          <div
            key={index}
            className="p-4 rounded-lg bg-muted/30 border border-border/50 space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-body font-semibold text-sm text-foreground flex-1">
                {action.title}
              </h4>
              <span
                className={cn(
                  "text-[10px] font-body font-bold px-2 py-0.5 rounded border",
                  priorityColors[action.priority]
                )}
              >
                {action.priority}
              </span>
            </div>
            
            <p className="font-body text-xs text-foreground/80 leading-relaxed">
              {action.description}
            </p>
            
            <div className="p-2 rounded bg-primary/5 border border-primary/10">
              <p className="font-body text-xs text-primary/90 italic">
                Why it matters: {action.why_it_matters}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2 pt-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground font-body">
                <Wrench className="h-3 w-3" />
                <span>{action.effort}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground font-body">
                <Clock className="h-3 w-3" />
                <span>{action.timeline}</span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ActionPlan;
