import type { ActionItem } from "@/types/report";

interface ActionPlanProps {
  actions: ActionItem[];
}

const ActionPlan = ({ actions }: ActionPlanProps) => {
  const sortedActions = [...actions].sort((a, b) => {
    const order = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    return order[a.priority] - order[b.priority];
  });

  return (
    <section className="mb-12 print:break-inside-avoid">
      <h2 className="font-display text-2xl font-bold text-gray-900 mb-2 pb-2 border-b border-gray-200">
        Personalized Action Plan
      </h2>
      <p className="font-body text-gray-600 mb-8">
        The following recommendations are prioritized based on your specific situation and assessment results. Each action has been carefully selected to address the most important aspects of your preparedness journey.
      </p>
      
      <div className="space-y-10">
        {sortedActions.map((action, index) => (
          <div key={index} className="print:break-inside-avoid">
            <div className="flex items-start gap-3 mb-2">
              <h3 className="font-display text-lg font-semibold text-gray-900">
                {action.title}
              </h3>
              <span className="text-xs font-display font-bold uppercase px-2 py-1 rounded bg-gray-100 text-gray-600 whitespace-nowrap">
                {action.priority} PRIORITY
              </span>
            </div>
            
            <p className="font-body text-gray-700 leading-relaxed mb-3">
              {action.description}
            </p>
            
            <p className="font-body text-gray-600 italic mb-3">
              <span className="font-semibold not-italic text-gray-900">Why this matters:</span>{" "}
              {action.why_it_matters}
            </p>
            
            <p className="font-body text-sm text-gray-500">
              <span className="font-semibold">Effort:</span> {action.effort}
              <span className="mx-3">•</span>
              <span className="font-semibold">Timeline:</span> {action.timeline}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ActionPlan;
