import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { getScoreTier } from "@/data/findabilityQuestions";
import { ClipboardList, FolderLock, Users } from "lucide-react";

interface ResultsScoreHeroProps {
  score: number;
}

const tierLabels: Record<string, string> = {
  strong: "Well Prepared",
  unclear: "Partially Prepared",
  fragile: "Just Getting Started",
};

const tierHeadlines: Record<string, string> = {
  strong: "You're ahead of most.",
  unclear: "You've started something important.",
  fragile: "You're not alone.",
};

const tierSubheadlines: Record<string, string> = {
  strong: "Let's make sure nothing slips through the cracks.",
  unclear: "Let's close the gaps together.",
  fragile: "And this is completely fixable.",
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
    <div className="bg-primary/[0.03] rounded-2xl border border-primary/10 p-6 md:p-8 space-y-5">
      {/* Score circle centered */}
      <div className="flex flex-col items-center gap-2">
        <div
          className={cn(
            "w-24 h-24 rounded-full flex items-center justify-center border-4 transition-all duration-500",
            tier.color === "green" && "border-primary bg-primary/10",
            tier.color === "amber" && "border-amber-500 bg-amber-500/10",
            tier.color === "red" && "border-muted-foreground/40 bg-muted/40"
          )}
        >
          <span className="font-display text-3xl font-bold text-foreground">
            {displayScore}
          </span>
        </div>
        <span
          className={cn(
            "inline-block px-3 py-1 rounded-full text-xs font-body font-medium",
            tier.color === "green" && "bg-primary/15 text-primary",
            tier.color === "amber" && "bg-amber-500/15 text-amber-700",
            tier.color === "red" && "bg-muted text-muted-foreground"
          )}
        >
          {tierLabels[tierKey]}
        </span>
      </div>

      {/* Text content below score */}
      <div className="space-y-3 text-center">
        <h1 className="font-display text-xl md:text-2xl font-semibold text-foreground">
          {tierHeadlines[tierKey]}
        </h1>
        <p className="font-body text-base text-muted-foreground">
          {tierSubheadlines[tierKey]}
        </p>
        <p className="font-body text-sm text-muted-foreground/80 leading-relaxed">
          Your Findability Score measures whether the right people could find and act on what matters — like important documents, accounts, and wishes — if they ever needed to.
        </p>
        <p className="font-body text-sm text-muted-foreground/70 leading-relaxed">
          {tierKey === "strong"
            ? "Most people haven't thought about this at all. You're in a strong position — let's make sure it stays that way."
            : tierKey === "unclear"
            ? "Many people don't even know where to start. The fact that you're here means you're already ahead."
            : "Most families aren't prepared for the unexpected. Taking this assessment is the first real step toward changing that."}
        </p>
      </div>

      {/* Feature highlights */}
      <div className="space-y-3 pt-2">
        {[
          { icon: ClipboardList, text: "Up to 72 questions tailored to your life needs" },
          { icon: FolderLock, text: "Track and store your documents with EasyVault" },
          { icon: Users, text: "Add your loved ones to your Trust Network, keeping them in the loop as your Life Readiness journey progresses" },
        ].map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4 text-primary" />
            </div>
            <p className="font-body text-sm text-foreground/80 leading-relaxed">{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResultsScoreHero;
