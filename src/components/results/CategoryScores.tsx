import { Progress } from "@/components/ui/progress";
import { BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CategoryAnalysis } from "@/types/report";

interface CategoryScoresProps {
  categories: CategoryAnalysis[];
}

const getScoreColor = (score: number) => {
  if (score >= 80) return "text-green-700";
  if (score >= 60) return "text-emerald-700";
  if (score >= 40) return "text-amber-700";
  return "text-red-600";
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

  // Handle score - could be decimal (0-1) or percentage (0-100)
  const normalizeScore = (score: number) => {
    return score <= 1 ? Math.round(score * 100) : Math.round(score);
  };

  return (
    <div className="print:break-inside-avoid">
      <h2 className="font-display text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-primary" />
        Category Breakdown
      </h2>
      <div className="space-y-5">
        {sortedCategories.map((category) => {
          const normalizedScore = normalizeScore(category.score);
          return (
            <div key={category.section_id} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-body text-sm font-semibold text-gray-900">
                  {category.section_label}
                </span>
                <span className={cn("text-sm font-body font-bold", getScoreColor(normalizedScore))}>
                  {normalizedScore}%
                </span>
              </div>
              <Progress 
                value={normalizedScore} 
                className={cn("h-2 bg-gray-200", getProgressColor(normalizedScore))} 
              />
              <p className="font-body text-xs text-gray-600 leading-relaxed">
                {category.analysis}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryScores;
