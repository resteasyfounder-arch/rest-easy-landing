import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Bookmark, ArrowRight, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import AppLayout from "@/components/layout/AppLayout";
import Header from "@/components/Header";
import { getScoreTier } from "@/data/findabilityQuestions";

interface StoredResults {
  score: number;
  biggestRisk: string;
  completedAt: string;
}

const tierDescriptions = {
  strong: "Things are likely findable — but most people here still discover blind spots when they look closer.",
  unclear: "Some things may exist, but access or clarity could break down under stress.",
  fragile: "If something happened, others would likely struggle to find and act on what matters.",
};

const Results = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState<StoredResults | null>(null);
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem("findabilityResults");
    if (stored) {
      setResults(JSON.parse(stored));
    }
  }, []);

  // Animate score count up
  useEffect(() => {
    if (!results) return;
    
    const duration = 1500;
    const steps = 60;
    const increment = results.score / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= results.score) {
        setDisplayScore(results.score);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.round(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [results]);

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
              Take Assessment
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const tier = getScoreTier(results.score);
  const tierKey = tier.label.split(" ")[1].toLowerCase() as "strong" | "unclear" | "fragile";

  return (
    <AppLayout>
      <Header />
      <div className="pt-20 px-4 pb-8">
        <div className="max-w-md mx-auto text-center space-y-8 animate-fade-up py-8">
          {/* Score circle */}
          <div className="relative mx-auto">
            <div
              className={cn(
                "w-36 h-36 rounded-full flex items-center justify-center border-4 mx-auto",
                tier.color === "green" && "border-green-500 bg-green-500/10",
                tier.color === "amber" && "border-amber-500 bg-amber-500/10",
                tier.color === "red" && "border-red-400 bg-red-400/10"
              )}
            >
              <span className="font-display text-5xl font-bold text-foreground">
                {displayScore}
              </span>
            </div>
          </div>

          {/* Tier label */}
          <div className="space-y-3">
            <span
              className={cn(
                "inline-block px-4 py-2 rounded-full text-sm font-body font-medium",
                tier.color === "green" && "bg-green-500/20 text-green-700",
                tier.color === "amber" && "bg-amber-500/20 text-amber-700",
                tier.color === "red" && "bg-red-400/20 text-red-700"
              )}
            >
              {tier.label}
            </span>
            <p className="text-muted-foreground font-body">
              {tierDescriptions[tierKey]}
            </p>
          </div>

          {/* Biggest risk insight */}
          <div className="bg-card rounded-xl p-6 shadow-card border border-border/50 text-left">
            <p className="text-xs font-body text-muted-foreground uppercase tracking-wider mb-2">
              Biggest risk we see
            </p>
            <p className="font-body text-foreground font-medium">
              {results.biggestRisk}
            </p>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-muted-foreground font-body">
            This score reflects access and clarity — not legal validity.
          </p>

          {/* CTAs */}
          <div className="flex flex-col gap-3 pt-2">
            <Button
              size="lg"
              onClick={() => navigate("/login")}
              className="w-full font-body font-medium press-effect gap-2"
            >
              See My First Rescue Mission
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/assessment")}
              className="w-full font-body gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Retake Assessment
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Results;
