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
      {/* Curved SVG connector to next step - connects bento boxes */}
      {!isLast && (
        <div className="hidden lg:block absolute left-0 right-0 top-full h-20 overflow-visible pointer-events-none z-10">
          <svg
            className="absolute w-full h-full"
            viewBox="0 0 1200 80"
            fill="none"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Curved path - connects from current bento to next bento */}
            <path
              d={reversed 
                ? "M 900 0 C 900 40, 300 40, 300 80"  // From right bento to left bento
                : "M 300 0 C 300 40, 900 40, 900 80"  // From left bento to right bento
              }
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              strokeDasharray="6 8"
              strokeLinecap="round"
              strokeOpacity="0.4"
            />
          </svg>
        </div>
      )}

      <div
        className={cn(
          "container mx-auto px-4 lg:px-8 py-12 lg:py-16",
          "grid lg:grid-cols-2 gap-8 lg:gap-16 items-center"
        )}
      >
        {/* Demo Card - on mobile: appears second (below text) */}
        <AnimatedItem
          animation="fade-up"
          delay={100}
          className={cn(
            "order-2", // Mobile: always second
            reversed ? "lg:order-2" : "lg:order-1" // Desktop: follows alternating pattern
          )}
        >
          <BentoCard icon={icon} title={cardTitle} subtitle={cardSubtitle}>
            {demo}
          </BentoCard>
        </AnimatedItem>

        {/* Content - on mobile: appears first (above demo) */}
        <AnimatedItem
          animation="fade-up"
          delay={200}
          className={cn(
            "space-y-4 order-1", // Mobile: always first
            reversed ? "lg:order-1" : "lg:order-2" // Desktop: follows alternating pattern
          )}
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
