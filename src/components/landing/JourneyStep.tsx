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
      {/* Curved SVG connector to next step */}
      {!isLast && (
        <div className="hidden lg:block absolute left-0 right-0 top-full h-24 overflow-visible pointer-events-none z-10">
          <svg
            className="absolute w-full h-full"
            viewBox="0 0 1200 96"
            fill="none"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Curved path - alternates direction based on reversed */}
            <path
              d={reversed 
                ? "M 300 0 Q 300 48, 600 48 Q 900 48, 900 96"
                : "M 900 0 Q 900 48, 600 48 Q 300 48, 300 96"
              }
              stroke="url(#journeyGradient)"
              strokeWidth="2"
              strokeDasharray="8 6"
              strokeLinecap="round"
              className="animate-[dash_20s_linear_infinite]"
            />
            {/* Gradient definition */}
            <defs>
              <linearGradient id="journeyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
                <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
              </linearGradient>
            </defs>
            {/* Animated dot along the path */}
            <circle r="4" fill="hsl(var(--primary))" className="opacity-80">
              <animateMotion
                dur="4s"
                repeatCount="indefinite"
                path={reversed 
                  ? "M 300 0 Q 300 48, 600 48 Q 900 48, 900 96"
                  : "M 900 0 Q 900 48, 600 48 Q 300 48, 300 96"
                }
              />
            </circle>
          </svg>
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
          className={cn(reversed && "lg:order-2")}
        >
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
