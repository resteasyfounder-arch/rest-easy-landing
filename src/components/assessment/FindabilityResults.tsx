import { type AnswerValue } from "@/data/findabilityQuestions";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import logo from "@/assets/rest-easy-logo.png";
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
      {/* Navigation bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14 md:h-16">
            <Link to="/" className="flex items-center shrink-0">
              <img src={logo} alt="Rest Easy" className="h-8 md:h-10 w-auto" />
            </Link>
            <Button variant="ghost" asChild>
              <Link to="/login">Log In</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-lg md:max-w-3xl mx-auto px-4 pt-20 md:pt-24 pb-10 space-y-8">
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
