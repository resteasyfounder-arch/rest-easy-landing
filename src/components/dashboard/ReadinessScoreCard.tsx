import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ScoreTier, SectionState } from "@/types/assessment";
import { TierBadge } from "./TierBadge";

interface ReadinessScoreCardProps {
  score: number;
  tier: ScoreTier;
  actionsRemaining: number;
  actionsTotal: number;
  sections: SectionState[];
  onViewByCategory?: () => void;
  className?: string;
}

function getScoreBarColor(score: number): string {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-primary";
  if (score >= 40) return "bg-yellow-500";
  return "bg-amber-500";
}

export function ReadinessScoreCard({
  score,
  tier,
  actionsRemaining,
  actionsTotal,
  sections,
  onViewByCategory,
  className,
}: ReadinessScoreCardProps) {
  const applicableSections = sections.filter((s) => s.is_applicable);
  const pointsToMax = 100 - score;

  return (
    <Card className={cn("border-border/50", className)}>
      <CardContent className="p-6 space-y-5">
        {/* Score Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Readiness Score
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-5xl font-bold text-foreground">{score}</span>
              <span className="text-2xl text-muted-foreground">/100</span>
            </div>
            <TierBadge tier={tier} size="sm" className="mt-2" />
          </div>

          {/* Actions badge */}
          <div className="text-right">
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 text-sm font-medium">
              <span>{actionsRemaining}/{actionsTotal}</span>
              <span className="text-amber-500/80">actions</span>
            </div>
          </div>
        </div>

        {/* View by Category button */}
        {onViewByCategory && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onViewByCategory}
            className="gap-1"
          >
            View by Category
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}

        {/* Progress indicator */}
        <div className="text-xs text-muted-foreground">
          {pointsToMax} pts to 100
        </div>

        {/* Compact category bars */}
        <div className="space-y-2.5">
          {applicableSections.map((section) => (
            <div key={section.id} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-28 truncate" title={section.label}>
                {section.label}
              </span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all", getScoreBarColor(section.score))}
                  style={{ width: `${section.score}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground w-8 text-right">
                {section.score}%
              </span>
            </div>
          ))}
        </div>

        {/* Footer message */}
        <div className="flex items-start gap-2 pt-2 border-t border-border/50 text-sm text-muted-foreground">
          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
          <span>Use the roadmap below to keep making progress toward your goals.</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default ReadinessScoreCard;
