import { ClipboardList, Clock, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ActionItem } from "@/types/report";

interface ActionPlanProps {
  actions: ActionItem[];
}

const priorityStyles = {
  HIGH: { bg: "bg-red-50", border: "border-red-200", badge: "bg-red-100 text-red-700" },
  MEDIUM: { bg: "bg-amber-50", border: "border-amber-200", badge: "bg-amber-100 text-amber-700" },
  LOW: { bg: "bg-green-50", border: "border-green-200", badge: "bg-green-100 text-green-700" },
};

const ActionPlan = ({ actions }: ActionPlanProps) => {
  // Sort by priority: HIGH first, then MEDIUM, then LOW
  const sortedActions = [...actions].sort((a, b) => {
    const order = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    return order[a.priority] - order[b.priority];
  });

  return (
    <div className="print:break-inside-avoid">
      <h2 className="font-display text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <ClipboardList className="h-5 w-5 text-primary" />
        Your Action Plan
      </h2>
      <p className="text-sm text-gray-600 font-body mb-6">
        Step-by-step guide to improving your readiness
      </p>
      
      <div className="space-y-4">
        {sortedActions.map((action, index) => {
          const styles = priorityStyles[action.priority];
          return (
            <div
              key={index}
              className={cn(
                "p-5 rounded-lg border print:break-inside-avoid",
                styles.bg,
                styles.border
              )}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="font-body font-semibold text-gray-900 flex-1">
                  {action.title}
                </h3>
                <span className={cn("text-xs font-body font-bold px-2 py-1 rounded", styles.badge)}>
                  {action.priority}
                </span>
              </div>
              
              {/* Description */}
              <p className="font-body text-sm text-gray-700 leading-relaxed mb-3">
                {action.description}
              </p>
              
              {/* Why It Matters */}
              <div className="bg-white/60 rounded p-3 mb-3 border border-gray-200/50">
                <p className="font-body text-sm text-gray-600 italic">
                  <span className="font-semibold not-italic">Why it matters:</span> {action.why_it_matters}
                </p>
              </div>
              
              {/* Meta Info */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 font-body">
                  <Wrench className="h-4 w-4 text-gray-500" />
                  <span>{action.effort}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 font-body">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>{action.timeline}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActionPlan;
