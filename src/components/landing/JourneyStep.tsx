import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { BentoCard } from "./BentoCard";
import { AnimatedItem } from "@/hooks/useScrollAnimation";

interface JourneyStepProps {
  step: number;
  title: string;
  description: string;
  demo: ReactNode;
  icon: LucideIcon;
  cardTitle: string;
  cardSubtitle: string;
  reversed?: boolean;
  isLast?: boolean;
}

const JourneyStep = ({
  step,
  title,
  description,
  demo,
  icon,
  cardTitle,
  cardSubtitle,
  reversed = false,
  isLast = false,
}: JourneyStepProps) => {
  return (
    <div className="relative">
      {/* Connector line to next step */}
      {!isLast && (
        <div 
          className={cn(
            "hidden lg:block absolute left-1/2 -translate-x-1/2 top-full w-px h-16",
            "border-l-2 border-dashed border-primary/30"
          )}
        >
          {/* Animated dot traveling down the line */}
          <div className="absolute left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary/60 animate-pulse" 
               style={{ top: '50%' }} 
          />
        </div>
      )}

      <div
        className={cn(
          "container mx-auto px-4 lg:px-8 py-12 lg:py-16",
          "grid lg:grid-cols-2 gap-8 lg:gap-16 items-center"
        )}
      >
        {/* Demo Card */}
        <AnimatedItem
          animation="fade-up"
          delay={100}
          className={cn("relative", reversed && "lg:order-2")}
        >
          {/* Step number badge on card */}
          <div className={cn(
            "absolute -top-3 z-10",
            reversed ? "lg:right-4 left-4 lg:left-auto" : "left-4"
          )}>
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold shadow-lg">
              {step}
            </div>
          </div>
          <BentoCard icon={icon} title={cardTitle} subtitle={cardSubtitle}>
            {demo}
          </BentoCard>
        </AnimatedItem>

        {/* Content */}
        <AnimatedItem
          animation="fade-up"
          delay={200}
          className={cn("space-y-4", reversed && "lg:order-1")}
        >
          <Badge variant="secondary" className="font-body">
            Step {step}
          </Badge>
          <h3 className="font-display text-2xl lg:text-3xl xl:text-4xl font-semibold text-foreground leading-tight">
            {title}
          </h3>
          <p className="font-body text-lg text-muted-foreground leading-relaxed max-w-lg">
            {description}
          </p>
        </AnimatedItem>
      </div>
    </div>
  );
};

export default JourneyStep;
