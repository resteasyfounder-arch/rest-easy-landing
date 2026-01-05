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
  const visibleSteps = rescueMission.steps.slice(0, 3);
  
  // Mock locked steps to show value
  const lockedSteps = [
    "Set up backup access method",
    "Create emergency contact protocol",
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 justify-center">
        <Target className="w-5 h-5 text-primary" />
        <h2 className="font-display text-xl font-semibold text-foreground">
          Your First Rescue Mission
        </h2>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        {/* Mission header */}
        <div className="bg-primary/5 border-b border-border p-4">
          <p className="text-xs font-body text-muted-foreground uppercase tracking-wider mb-1">
            Based on your answers
          </p>
          <h3 className="font-display text-lg font-semibold text-foreground">
            {rescueMission.title}
          </h3>
          <p className="text-sm font-body text-muted-foreground mt-1">
            Focus area: {categoryLabel}
          </p>
        </div>

        {/* Mission steps */}
        <div className="p-4 space-y-3">
          {/* Visible/unlocked steps */}
          {visibleSteps.map((step, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg bg-background border border-border/50"
            >
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-4 h-4 text-primary" />
              </div>
              <p className="font-body text-sm text-foreground">{step}</p>
            </div>
          ))}

          {/* Locked/teaser steps */}
          {lockedSteps.map((step, index) => (
            <div
              key={`locked-${index}`}
              className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/30"
            >
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                <Lock className="w-3 h-3 text-muted-foreground" />
              </div>
              <p className="font-body text-sm text-muted-foreground blur-[1px]">
                {step}
              </p>
            </div>
          ))}
        </div>

        {/* Teaser footer */}
        <div className="bg-muted/30 border-t border-border px-4 py-3">
          <p className="text-xs font-body text-center text-muted-foreground">
            <span className="font-medium text-foreground">+5 more steps</span> in your personalized mission
          </p>
        </div>
      </div>
    </div>
  );
};

export default RescueMissionPreview;
