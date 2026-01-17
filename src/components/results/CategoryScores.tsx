import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CategoryAnalysis } from "@/types/report";

interface CategoryScoresProps {
  categories: CategoryAnalysis[];
}

const getScoreColor = (score: number) => {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-emerald-600";
  if (score >= 40) return "text-amber-600";
  return "text-red-500";
};

const getProgressColor = (score: number) => {
  if (score >= 80) return "[&>div]:bg-green-500";
  if (score >= 60) return "[&>div]:bg-emerald-500";
  if (score >= 40) return "[&>div]:bg-amber-500";
  return "[&>div]:bg-red-400";
};

const CategoryScores = ({ categories }: CategoryScoresProps) => {
  // Sort by score ascending to show areas needing work first
  const sortedCategories = [...categories].sort((a, b) => a.score - b.score);

  return (
    <Card className="border-primary/20 bg-card shadow-soft">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <BarChart3 className="h-5 w-5 text-primary" />
          Category Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {sortedCategories.map((category) => (
          <div key={category.section_id} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-body text-sm font-medium text-foreground">
                {category.section_label}
              </span>
              <span className={cn("text-sm font-body font-semibold", getScoreColor(category.score))}>
                {category.score}%
              </span>
            </div>
            <Progress 
              value={category.score} 
              className={cn("h-2", getProgressColor(category.score))} 
            />
            <p className="font-body text-xs text-muted-foreground leading-relaxed">
              {category.analysis}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default CategoryScores;
