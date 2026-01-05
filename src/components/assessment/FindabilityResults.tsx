import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Bookmark, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { getScoreTier } from "@/data/findabilityQuestions";

interface FindabilityResultsProps {
  score: number;
  biggestRisk: string;
}

const tierDescriptions = {
  strong: "Things are likely findable — but most people here still discover blind spots when they look closer.",
  unclear: "Some things may exist, but access or clarity could break down under stress.",
  fragile: "If something happened, others would likely struggle to find and act on what matters.",
};

const FindabilityResults = ({ score, biggestRisk }: FindabilityResultsProps) => {
  const navigate = useNavigate();
  const [displayScore, setDisplayScore] = useState(0);
  const tier = getScoreTier(score);

  // Animate score count up
  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = score / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        setDisplayScore(score);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.round(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [score]);

  const tierKey = tier.label.split(" ")[1].toLowerCase() as "strong" | "unclear" | "fragile";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-hero">
      <div className="max-w-md text-center space-y-8 animate-fade-up">
        {/* Score circle */}
        <div className="relative mx-auto">
          <div
            className={cn(
              "w-36 h-36 rounded-full flex items-center justify-center border-4",
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
            {biggestRisk}
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
            onClick={() => {
              // For now, just show a toast or navigate home
              navigate("/");
            }}
            className="w-full font-body gap-2"
          >
            <Bookmark className="h-4 w-4" />
            Save This & Finish Later
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FindabilityResults;
