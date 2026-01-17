import { Zap } from "lucide-react";
import type { ImmediateAction } from "@/types/report";

interface ImmediateActionsProps {
  actions: ImmediateAction[];
}

const ImmediateActions = ({ actions }: ImmediateActionsProps) => {
  // Sort by priority
  const sortedActions = [...actions].sort((a, b) => a.priority - b.priority);

  return (
    <div className="print:break-inside-avoid">
      <h2 className="font-display text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Zap className="h-5 w-5 text-amber-600" />
        Quick Wins
      </h2>
      <p className="text-sm text-gray-600 font-body mb-4">
        Your top priorities to address this week
      </p>
      <div className="space-y-3">
        {sortedActions.map((action, index) => (
          <div
            key={index}
            className="flex gap-4 p-4 rounded-lg bg-amber-50 border border-amber-200"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center">
              <span className="font-display text-sm font-bold text-white">
                {index + 1}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="font-body font-semibold text-gray-900 mb-1">
                {action.title}
              </h3>
              <p className="font-body text-sm text-gray-600 leading-relaxed">
                {action.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImmediateActions;
