import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/layout/AppLayout";
import Header from "@/components/Header";
import { calculateScore, type AnswerValue } from "@/data/findabilityQuestions";
import ResultsScoreHero from "@/components/assessment/results/ResultsScoreHero";
import ResultsBreakdown from "@/components/assessment/results/ResultsBreakdown";
import RescueMissionPreview from "@/components/assessment/results/RescueMissionPreview";
import LifeReadinessTeaser from "@/components/assessment/results/LifeReadinessTeaser";
import ResultsTrustSection from "@/components/assessment/results/ResultsTrustSection";
import ResultsCTA from "@/components/assessment/results/ResultsCTA";

interface StoredResults {
  score: number;
  biggestRisk: string;
  answers: Record<string, AnswerValue>;
  completedAt: string;
}

const Results = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState<StoredResults | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("findabilityResults");
    if (stored) {
      setResults(JSON.parse(stored));
    }
  }, []);

  // No results - prompt to take assessment
  if (!results) {
    return (
      <AppLayout>
        <Header />
        <div className="pt-20 px-4 pb-8">
          <div className="max-w-lg mx-auto text-center py-12">
            <h1 className="text-3xl font-display font-semibold text-foreground mb-4">
              Your Results
            </h1>
            <p className="text-muted-foreground font-body mb-8">
              Complete the Findability Score assessment to see your personalized results and recommendations.
            </p>
            <Button onClick={() => navigate("/assessment")} className="press-effect">
              Get Your Findability Score
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Header />
      <div className="pt-20 pb-8">
        <div className="max-w-lg mx-auto px-4 space-y-8">
          {/* Score Hero */}
          <ResultsScoreHero score={results.score} />

          {/* Rescue Mission Preview */}
          <RescueMissionPreview answers={results.answers} />

          {/* Answer Breakdown */}
          <ResultsBreakdown answers={results.answers} />

          {/* Life Readiness Teaser */}
          <LifeReadinessTeaser />

          {/* Trust Section */}
          <ResultsTrustSection />

          {/* CTAs */}
          <ResultsCTA />
        </div>
      </div>
    </AppLayout>
  );
};

export default Results;
