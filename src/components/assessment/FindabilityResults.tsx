import { type AnswerValue } from "@/data/findabilityQuestions";
import ResultsScoreHero from "./results/ResultsScoreHero";
import ResultsBreakdown from "./results/ResultsBreakdown";
import RescueMissionPreview from "./results/RescueMissionPreview";
import LifeReadinessTeaser from "./results/LifeReadinessTeaser";
import ResultsTrustSection from "./results/ResultsTrustSection";
import ResultsCTA from "./results/ResultsCTA";

interface FindabilityResultsProps {
  score: number;
  answers: Record<string, AnswerValue>;
  onRetake?: () => void;
}

const FindabilityResults = ({ score, answers, onRetake }: FindabilityResultsProps) => {
  return (
    <div className="min-h-full bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-lg mx-auto px-4 pb-6 space-y-5">
        {/* Score Hero */}
        <ResultsScoreHero score={score} />

        {/* Rescue Mission Preview */}
        <RescueMissionPreview answers={answers} />

        {/* Answer Breakdown */}
        <ResultsBreakdown answers={answers} />

        {/* Life Readiness Teaser */}
        <LifeReadinessTeaser />

        {/* Trust Section */}
        <ResultsTrustSection />

        {/* CTAs */}
        <ResultsCTA onRetake={onRetake} />
      </div>
    </div>
  );
};

export default FindabilityResults;
