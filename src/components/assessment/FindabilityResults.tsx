import { type AnswerValue } from "@/data/findabilityQuestions";
import ResultsScoreHero from "./results/ResultsScoreHero";
import RemySummaryCard from "./results/RemySummaryCard";
import ResultsBreakdown from "./results/ResultsBreakdown";
import LifeReadinessTeaser from "./results/LifeReadinessTeaser";
import ResultsCTA from "./results/ResultsCTA";

interface AiSummary {
  summary: string;
  top_priority: string;
  encouragement: string;
}

interface FindabilityResultsProps {
  score: number;
  answers: Record<string, AnswerValue>;
  onRetake?: () => void;
  aiSummary?: AiSummary;
}

const FindabilityResults = ({ score, answers, onRetake, aiSummary }: FindabilityResultsProps) => {
  return (
    <div className="min-h-full bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-lg md:max-w-3xl mx-auto px-4 pt-8 md:pt-12 pb-10 space-y-8">
        {/* Hero + Remy side by side on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <ResultsScoreHero score={score} />
          {aiSummary && <RemySummaryCard aiSummary={aiSummary} />}
        </div>

        {/* Full-width grouped breakdown */}
        <ResultsBreakdown answers={answers} />

        {/* Soft divider — forward momentum */}
        <div className="border-t border-border/50 pt-8">
          <LifeReadinessTeaser />
        </div>

        {/* Single calm CTA */}
        <ResultsCTA onRetake={onRetake} />
      </div>
    </div>
  );
};

export default FindabilityResults;
