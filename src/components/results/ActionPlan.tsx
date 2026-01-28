import type { ActionItem } from "@/types/report";
import { CheckCircle2, ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActionPlanProps {
  actions: ActionPlanItem[];
}

const ActionPlan = ({ actions }: ActionPlanProps) => {
  // Sort by priority (high first) and complexity (low first) for quick wins
  const sortedActions = [...actions].sort((a, b) => {
    const priorityMap = { high: 3, medium: 2, low: 1 };
    if (priorityMap[a.priority] !== priorityMap[b.priority]) {
      return priorityMap[b.priority] - priorityMap[a.priority];
    }
    const complexityMap = { low: 1, medium: 2, high: 3 };
    return complexityMap[a.complexity] - complexityMap[b.complexity];
  });

  return (
    <section id="action-plan" className="break-inside-avoid">
      <div className="mb-8">
        <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
          Your Action Roadmap
        </h2>
        <p className="text-muted-foreground font-body max-w-2xl">
          A step-by-step guide to improving your readiness score. We recommend starting with high-priority items that are easier to complete.
        </p>
      </div>

      <div className="space-y-4">
        {sortedActions.map((action, index) => (
          <div
            key={index}
            className="group flex flex-col md:flex-row gap-5 p-6 rounded-xl bg-card border border-border/40 hover:border-primary/20 transition-colors"
          >
            {/* Status Icon */}
            <div className="hidden md:flex flex-shrink-0 mt-1">
              <div className="h-6 w-6 rounded-full border-2 border-primary/20 flex items-center justify-center group-hover:border-primary/50 transition-colors">
                <span className="text-xs font-medium text-primary">{index + 1}</span>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h3 className="font-display text-lg font-medium text-foreground">
                  {action.task}
                </h3>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${action.priority === 'high' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                    'bg-secondary text-secondary-foreground'
                    }`}>
                    {action.priority.charAt(0).toUpperCase() + action.priority.slice(1)} Priority
                  </span>
                </div>
              </div>

              <p className="text-muted-foreground font-body leading-relaxed text-sm">
                {action.reason}
              </p>

              <div className="pt-2 flex items-center gap-4 text-xs text-muted-foreground/70">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {action.time_estimate}
                </span>
                <span>•</span>
                <span>{action.complexity.charAt(0).toUpperCase() + action.complexity.slice(1)} Complexity</span>
              </div>
            </div>

            {/* Action */}
            <div className="md:self-center pt-2 md:pt-0">
              <Button variant="outline" size="sm" className="w-full md:w-auto gap-2 group-hover:border-primary/30">
                Start Task <ArrowRight className="h-4 w-4 opacity-50 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ActionPlan;
