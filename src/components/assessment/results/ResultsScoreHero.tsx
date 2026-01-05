import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { getScoreTier } from "@/data/findabilityQuestions";

interface ResultsScoreHeroProps {
  score: number;
}

const tierHeadlines = {
  strong: "You're ahead of most.",
  unclear: "You've started something important.",
  fragile: "You're not alone.",
};

const tierSubheadlines = {
  strong: "Let's make sure nothing slips through the cracks.",
  unclear: "Let's close the gaps together.",
  fragile: "And this is completely fixable.",
};

const tierDescriptions = {
  strong: "Things are likely findable — but most people here still discover blind spots when they look closer.",
  unclear: "Some things may exist, but access or clarity could break down under stress.",
  fragile: "If something happened, others would likely struggle to find and act on what matters.",
};

const ResultsScoreHero = ({ score }: ResultsScoreHeroProps) => {
  const [displayScore, setDisplayScore] = useState(0);
  const tier = getScoreTier(score);
  const tierKey = tier.label.split(" ")[1].toLowerCase() as "strong" | "unclear" | "fragile";

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

  return (
    <div className="text-center space-y-6 py-8">
      {/* Score circle */}
      <div className="relative mx-auto">
        <div
          className={cn(
            "w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center border-4 mx-auto transition-all duration-500",
            tier.color === "green" && "border-green-500 bg-green-500/10",
            tier.color === "amber" && "border-amber-500 bg-amber-500/10",
            tier.color === "red" && "border-red-400 bg-red-400/10"
          )}
        >
          <span className="font-display text-4xl md:text-5xl font-bold text-foreground">
            {displayScore}
          </span>
        </div>
      </div>

      {/* Tier badge */}
      <div>
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
      </div>

      {/* Personalized headlines */}
      <div className="space-y-2">
        <h1 className="font-display text-2xl md:text-3xl font-semibold text-foreground">
          {tierHeadlines[tierKey]}
        </h1>
        <p className="font-body text-lg text-muted-foreground">
          {tierSubheadlines[tierKey]}
        </p>
      </div>

      {/* Tier description */}
      <p className="font-body text-sm text-muted-foreground max-w-md mx-auto">
        {tierDescriptions[tierKey]}
      </p>

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground/70 font-body">
        This score measures access and clarity — not legal validity.
      </p>
    </div>
  );
};

export default ResultsScoreHero;
