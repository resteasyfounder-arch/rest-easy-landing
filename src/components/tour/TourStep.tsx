import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { TourStep as TourStepType } from "@/hooks/useFeatureTour";
import TourPreview from "./TourPreview";

interface TourStepProps {
  step: TourStepType;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  style?: React.CSSProperties;
}

const TourStep = ({
  step,
  currentStep,
  totalSteps,
  onNext,
  onBack,
  onSkip,
  style,
}: TourStepProps) => {
  const isFirst = currentStep === 0;
  const isLast = currentStep === totalSteps - 1;

  return (
    <div
      className="fixed z-[10001] w-[360px] animate-scale-in"
      style={style}
    >
      <div className="rounded-xl border border-border bg-card shadow-lg p-5 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-base font-semibold text-foreground leading-tight">
            {step.title}
          </h3>
          <button
            onClick={onSkip}
            className="shrink-0 rounded-full p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground font-body leading-relaxed">
          {step.description}
        </p>

        {/* Page Preview */}
        <TourPreview stepId={step.id} />

        {/* Footer */}
        <div className="flex items-center justify-between pt-1">
          {/* Step indicator */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentStep
                    ? "w-4 bg-primary"
                    : i < currentStep
                    ? "w-1.5 bg-primary/40"
                    : "w-1.5 bg-muted-foreground/20"
                }`}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center gap-1.5">
            {!isFirst && (
              <Button variant="ghost" size="sm" onClick={onBack} className="h-8 px-2">
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            <Button size="sm" onClick={onNext} className="h-8 gap-1">
              {isLast ? "Finish" : "Next"}
              {!isLast && <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourStep;
