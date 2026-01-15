import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface SectionTransitionProps {
  icon?: LucideIcon;
  closingMessage: string;
  nextSectionHint?: string;
  onContinue: () => void;
  className?: string;
}

const SectionTransition = ({
  icon: Icon,
  closingMessage,
  nextSectionHint,
  onContinue,
  className,
}: SectionTransitionProps) => {
  return (
    <div
      className={cn(
        "min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-hero",
        className
      )}
    >
      <div className="max-w-md text-center space-y-8 animate-fade-up">
        {/* Section icon */}
        {Icon && (
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon className="w-7 h-7 text-primary" strokeWidth={1.5} />
            </div>
          </div>
        )}

        {/* Closing message */}
        <p className="font-display text-xl md:text-2xl text-foreground leading-relaxed">
          {closingMessage}
        </p>

        {/* Next section hint */}
        {nextSectionHint && (
          <p className="text-base font-body text-muted-foreground">
            {nextSectionHint}
          </p>
        )}

        {/* Continue button */}
        <Button
          size="lg"
          onClick={onContinue}
          className="min-h-[56px] px-8 font-body font-medium text-base press-effect"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default SectionTransition;
