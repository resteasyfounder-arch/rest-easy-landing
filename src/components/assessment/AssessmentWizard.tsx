import { useState, ReactNode } from "react";
import { X, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import AssessmentProgress from "./AssessmentProgress";
import { cn } from "@/lib/utils";

interface AssessmentWizardProps {
  children: ReactNode[];
  title?: string;
  onComplete?: () => void;
}

const AssessmentWizard = ({ 
  children, 
  title = "Assessment",
  onComplete 
}: AssessmentWizardProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const totalSteps = children.length;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete?.();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    navigate(-1);
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col safe-area-top safe-area-bottom">
      {/* Header */}
      <header className="flex items-center justify-between px-4 h-14 border-b border-border/50">
        <Button
          variant="ghost"
          size="icon"
          onClick={currentStep > 0 ? handleBack : handleClose}
          className="touch-target press-effect"
        >
          {currentStep > 0 ? (
            <ArrowLeft className="h-5 w-5" />
          ) : (
            <X className="h-5 w-5" />
          )}
        </Button>
        <span className="font-body text-sm font-medium text-muted-foreground">
          {title}
        </span>
        <div className="w-10" /> {/* Spacer for centering */}
      </header>

      {/* Progress */}
      <AssessmentProgress 
        currentStep={currentStep} 
        totalSteps={totalSteps} 
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="h-full">
          {children.map((child, index) => (
            <div
              key={index}
              className={cn(
                "h-full transition-opacity duration-300",
                index === currentStep ? "block" : "hidden"
              )}
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="px-4 py-4 border-t border-border/50 bg-background">
        <Button
          onClick={handleNext}
          size="lg"
          className="w-full font-body press-effect"
        >
          {currentStep === totalSteps - 1 ? "Complete" : "Continue"}
        </Button>
      </footer>
    </div>
  );
};

export default AssessmentWizard;
