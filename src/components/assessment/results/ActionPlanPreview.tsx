import { Target, Check, Lock, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  findabilityQuestions,
  getWeakestCategory,
  type AnswerValue,
} from "@/data/findabilityQuestions";
import { Button } from "@/components/ui/button";

interface ActionPlanPreviewProps {
  answers: Record<string, AnswerValue>;
}

const ActionPlanPreview = ({ answers }: ActionPlanPreviewProps) => {
  const navigate = useNavigate();
  const weakestQuestion = getWeakestCategory(answers);

  if (!weakestQuestion) {
    return null;
  }

  const { actionPlan } = weakestQuestion;
  const visibleSteps = actionPlan.steps.slice(0, 2);

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="bg-primary/5 border-b border-border px-4 py-3 flex items-center gap-3">
        <Target className="w-5 h-5 text-primary flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-body text-muted-foreground">Your first priority</p>
          <h3 className="font-display text-base font-semibold text-foreground truncate">
            {actionPlan.title}
          </h3>
        </div>
      </div>

      {/* Steps */}
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
            <span className="font-medium">+{actionPlan.steps.length - 2} more steps</span> when you sign up
          </p>
        </div>

        {/* Sign-up nudge */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/login")}
          className="w-full text-primary font-body text-xs mt-1 gap-1"
        >
          Create a free account to unlock your full action plan
          <ArrowRight className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
};

export default ActionPlanPreview;
