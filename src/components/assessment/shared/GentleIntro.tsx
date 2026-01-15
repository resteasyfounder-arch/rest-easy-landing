import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface GentleIntroProps {
  headline: string;
  description: string;
  subtext?: string;
  ctaLabel?: string;
  onStart: () => void;
  className?: string;
}

const GentleIntro = ({
  headline,
  description,
  subtext,
  ctaLabel = "Let's Begin",
  onStart,
  className,
}: GentleIntroProps) => {
  return (
    <div
      className={cn(
        "min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-hero",
        className
      )}
    >
      <div className="max-w-md text-center space-y-8 animate-fade-up">
        {/* Subtle visual element */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Heart className="w-7 h-7 text-primary" strokeWidth={1.5} />
          </div>
        </div>

        {/* Headline */}
        <h1 className="font-display text-2xl md:text-3xl text-foreground leading-relaxed">
          {headline}
        </h1>

        {/* Description */}
        <p className="text-lg font-body text-muted-foreground leading-relaxed">
          {description}
        </p>

        {/* Optional subtext */}
        {subtext && (
          <p className="text-sm font-body text-muted-foreground/80">
            {subtext}
          </p>
        )}

        {/* CTA Button */}
        <Button
          size="lg"
          onClick={onStart}
          className="w-full max-w-xs min-h-[56px] font-body font-medium text-base press-effect"
        >
          {ctaLabel}
        </Button>
      </div>
    </div>
  );
};

export default GentleIntro;
