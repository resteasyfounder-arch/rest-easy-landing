import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompletionScreenProps {
  headline?: string;
  message?: string;
  primaryAction: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const CompletionScreen = ({
  headline = "Thank you for taking the time.",
  message = "Everything you've shared helps bring peace of mind — for you and the people who matter most.",
  primaryAction,
  secondaryAction,
  className,
}: CompletionScreenProps) => {
  return (
    <div
      className={cn(
        "min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-hero",
        className
      )}
    >
      <div className="max-w-md text-center space-y-8 animate-fade-up">
        {/* Heart icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Heart className="w-9 h-9 text-primary" strokeWidth={1.5} fill="currentColor" fillOpacity={0.2} />
          </div>
        </div>

        {/* Headline */}
        <h1 className="font-display text-2xl md:text-3xl text-foreground leading-relaxed">
          {headline}
        </h1>

        {/* Message */}
        <p className="text-lg font-body text-muted-foreground leading-relaxed">
          {message}
        </p>

        {/* Actions */}
        <div className="space-y-3 pt-4">
          <Button
            size="lg"
            onClick={primaryAction.onClick}
            className="w-full max-w-xs min-h-[56px] font-body font-medium text-base press-effect"
          >
            {primaryAction.label}
          </Button>

          {secondaryAction && (
            <Button
              variant="ghost"
              size="lg"
              onClick={secondaryAction.onClick}
              className="w-full max-w-xs min-h-[48px] font-body text-muted-foreground hover:text-foreground"
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompletionScreen;
