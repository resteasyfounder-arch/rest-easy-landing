import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ChevronRight, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SectionState } from "@/types/assessment";

interface CategoryBreakdownProps {
  sections: SectionState[];
  onCategoryClick?: (sectionId: string) => void;
  onViewDetails?: () => void;
  className?: string;
}

function getScoreColor(score: number): string {
  if (score >= 70) return "bg-emerald-500";
  if (score >= 40) return "bg-amber-500";
  return "bg-rose-500";
}

function getScoreLabel(score: number): string {
  if (score >= 70) return "Strong";
  if (score >= 40) return "Developing";
  return "Needs Attention";
}

export function CategoryBreakdown({
  sections,
  onCategoryClick,
  onViewDetails,
  className,
}: CategoryBreakdownProps) {
  // Only show applicable sections with scores
  const scoredSections = sections
    .filter((s) => s.is_applicable && s.status === "completed")
    .sort((a, b) => b.score - a.score);

  if (scoredSections.length === 0) {
    return null;
  }

  return (
    <Card className={cn("border-border/50", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <CardTitle className="font-display text-lg">Category Scores</CardTitle>
          </div>
          {onViewDetails && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onViewDetails}
              className="text-muted-foreground hover:text-foreground gap-1"
            >
              View Details
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {scoredSections.map((section) => (
          <button
            key={section.id}
            onClick={() => onCategoryClick?.(section.id)}
            disabled={!onCategoryClick}
            className={cn(
              "w-full text-left transition-colors",
              onCategoryClick && "hover:bg-muted/50 -mx-2 px-2 py-1 rounded-lg cursor-pointer"
            )}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-medium text-sm text-foreground">
                {section.label}
              </span>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded-full",
                  section.score >= 70 && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                  section.score >= 40 && section.score < 70 && "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                  section.score < 40 && "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                )}>
                  {getScoreLabel(section.score)}
                </span>
                <span className="text-sm font-medium text-foreground w-10 text-right">
                  {section.score}%
                </span>
              </div>
            </div>
            <div className="relative h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  "absolute inset-y-0 left-0 rounded-full transition-all duration-500",
                  getScoreColor(section.score)
                )}
                style={{ width: `${section.score}%` }}
              />
            </div>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}

export default CategoryBreakdown;
