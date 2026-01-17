import type { ImmediateAction } from "@/types/report";

interface ImmediateActionsProps {
  actions: ImmediateAction[];
}

const ImmediateActions = ({ actions }: ImmediateActionsProps) => {
  const sortedActions = [...actions].sort((a, b) => a.priority - b.priority);

  return (
    <section className="mb-12 print:break-inside-avoid">
      <h2 className="font-display text-2xl font-bold text-gray-900 mb-2 pb-2 border-b border-gray-200">
        Recommended Immediate Actions
      </h2>
      <p className="font-body text-gray-600 mb-6">
        The following three actions are recommended as your highest-impact first steps:
      </p>
      
      <div className="space-y-8">
        {sortedActions.map((action, index) => (
          <div key={index} className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-display font-bold text-sm">
              {index + 1}
            </div>
            <div className="flex-1 pt-1">
              <h3 className="font-display text-lg font-semibold text-gray-900 mb-2">
                {action.title}
              </h3>
              <p className="font-body text-gray-700 leading-relaxed">
                {action.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ImmediateActions;
