import { type AnswerValue } from "@/data/findabilityQuestions";
import ResultsScoreHero from "./results/ResultsScoreHero";
import RemySummaryCard from "./results/RemySummaryCard";
import ResultsBreakdown from "./results/ResultsBreakdown";
import ActionPlanPreview from "./results/ActionPlanPreview";
import LifeReadinessTeaser from "./results/LifeReadinessTeaser";
import ResultsTrustSection from "./results/ResultsTrustSection";
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
      <div className="max-w-lg mx-auto px-4 pb-6 space-y-5">
        <ResultsScoreHero score={score} />

        {aiSummary && <RemySummaryCard aiSummary={aiSummary} />}

        <ActionPlanPreview answers={answers} />
        <ResultsBreakdown answers={answers} />
        <LifeReadinessTeaser />
        <ResultsTrustSection />
        <ResultsCTA onRetake={onRetake} />
      </div>
    </div>
  );
};

export default FindabilityResults;
