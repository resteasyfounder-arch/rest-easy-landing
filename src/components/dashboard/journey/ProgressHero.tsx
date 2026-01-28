import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Play, Clock, Sparkles } from "lucide-react";

interface ProgressHeroProps {
  overallProgress: number;
  sectionsRemaining: number;
  currentSectionLabel?: string;
  estimatedMinutes?: number;
  onContinue: () => void;
  className?: string;
}

const ProgressHero = ({
  overallProgress,
  sectionsRemaining,
  currentSectionLabel,
  estimatedMinutes = 5,
  onContinue,
  className,
}: ProgressHeroProps) => {
  // Generate narrative text based on progress
  const getNarrativeText = () => {
    if (sectionsRemaining === 1) {
      return "You're on the final stretch!";
    }
    if (sectionsRemaining <= 2) {
      return `Just ${sectionsRemaining} sections to go`;
    }
    return `You're ${sectionsRemaining} sections away from your personalized report`;
  };

  return (
    <Card className={cn(
      "border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5 overflow-hidden shadow-soft",
      className
    )}>
      <CardContent className="p-6 sm:p-8">
        <div className="space-y-6">
          {/* Narrative headline */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
              <Sparkles className="h-3 w-3" />
              Your journey is underway
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-semibold text-foreground">
              {getNarrativeText()}
            </h2>
          </div>

          {/* Slim progress bar */}
          <div className="space-y-2 max-w-md mx-auto">
            <Progress value={overallProgress} className="h-2.5" />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{Math.round(overallProgress)}% complete</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                ~{estimatedMinutes} min left
              </span>
            </div>
          </div>

          {/* Continue CTA */}
          <div className="flex flex-col items-center gap-3">
            <Button
              size="lg"
              onClick={onContinue}
              className="gap-2 shadow-soft hover:shadow-card transition-all w-full sm:w-auto sm:min-w-[280px]"
            >
              <Play className="h-4 w-4" />
              Continue with {currentSectionLabel || "Next Section"}
            </Button>
            <p className="text-xs text-muted-foreground/70">
              Your progress is saved automatically
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressHero;
