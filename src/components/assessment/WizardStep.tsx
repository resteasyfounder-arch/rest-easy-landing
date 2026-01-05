import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface WizardStepProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

const WizardStep = ({ 
  title, 
  description, 
  children, 
  className 
}: WizardStepProps) => {
  return (
    <div className={cn("flex flex-col h-full px-6 py-8", className)}>
      {/* Question Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-display font-semibold text-foreground mb-2">
          {title}
        </h2>
        {description && (
          <p className="text-muted-foreground font-body">
            {description}
          </p>
        )}
      </div>

      {/* Answer Options */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
};

export default WizardStep;
