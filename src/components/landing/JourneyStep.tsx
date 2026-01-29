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
}: JourneyStepProps) => {
  return (
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
  );
};

export default JourneyStep;
