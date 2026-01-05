import { cn } from "@/lib/utils";

interface AssessmentProgressProps {
  currentStep: number;
  totalSteps: number;
  showStepIndicator?: boolean;
}

const AssessmentProgress = ({ 
  currentStep, 
  totalSteps,
  showStepIndicator = true
}: AssessmentProgressProps) => {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="px-4 py-3">
      {/* Progress Bar */}
      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step Indicator */}
      {showStepIndicator && (
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs font-body text-muted-foreground">
            Step {currentStep + 1} of {totalSteps}
          </span>
          <div className="flex gap-1">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-colors duration-300",
                  index <= currentStep ? "bg-primary" : "bg-secondary"
                )}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentProgress;
