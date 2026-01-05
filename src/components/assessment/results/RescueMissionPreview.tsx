import { Target, Check, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  findabilityQuestions,
  getWeakestCategory,
  type AnswerValue,
} from "@/data/findabilityQuestions";

interface RescueMissionPreviewProps {
  answers: Record<string, AnswerValue>;
}

const RescueMissionPreview = ({ answers }: RescueMissionPreviewProps) => {
  const weakestQuestion = getWeakestCategory(answers);

  if (!weakestQuestion) {
    return null;
  }

  const { rescueMission, categoryLabel } = weakestQuestion;
  const visibleSteps = rescueMission.steps.slice(0, 2);

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Mission header */}
      <div className="bg-primary/5 border-b border-border px-4 py-3 flex items-center gap-3">
        <Target className="w-5 h-5 text-primary flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-body text-muted-foreground">Your first mission</p>
          <h3 className="font-display text-base font-semibold text-foreground truncate">
            {rescueMission.title}
          </h3>
        </div>
      </div>

      {/* Mission steps - compact */}
      <div className="p-3 space-y-2">
        {visibleSteps.map((step, index) => (
          <div
            key={index}
            className="flex items-center gap-2 p-2 rounded-lg bg-background border border-border/50"
          >
            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Check className="w-3 h-3 text-primary" />
            </div>
            <p className="font-body text-sm text-foreground">{step}</p>
          </div>
        ))}

        {/* Locked teaser */}
        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 border border-border/30">
          <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
            <Lock className="w-3 h-3 text-muted-foreground" />
          </div>
          <p className="font-body text-sm text-muted-foreground">
            <span className="font-medium">+4 more steps</span> in your full mission
          </p>
        </div>
      </div>
    </div>
  );
};

export default RescueMissionPreview;
