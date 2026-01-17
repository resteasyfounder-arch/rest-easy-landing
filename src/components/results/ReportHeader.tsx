import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { ReportTier } from "@/types/report";

interface ReportHeaderProps {
  score: number;
  tier: ReportTier;
  userName: string;
  generatedAt: string;
}

const tierColors: Record<ReportTier, { border: string; bg: string; text: string }> = {
  "Rest Easy Ready": { border: "border-green-500", bg: "bg-green-500/10", text: "text-green-700" },
  "Well Prepared": { border: "border-emerald-500", bg: "bg-emerald-500/10", text: "text-emerald-700" },
  "On Your Way": { border: "border-amber-500", bg: "bg-amber-500/10", text: "text-amber-700" },
  "Getting Started": { border: "border-red-400", bg: "bg-red-400/10", text: "text-red-700" },
};

const ReportHeader = ({ score, tier, userName, generatedAt }: ReportHeaderProps) => {
  const [displayScore, setDisplayScore] = useState(0);
  const colors = tierColors[tier] || tierColors["Getting Started"];

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

  const formattedDate = new Date(generatedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="text-center space-y-4 py-6">
      <p className="text-sm text-muted-foreground font-body">
        Generated {formattedDate}
      </p>
      
      {/* Score circle + badge */}
      <div className="flex flex-col items-center gap-3">
        <div
          className={cn(
            "w-28 h-28 rounded-full flex items-center justify-center border-4 transition-all duration-500",
            colors.border,
            colors.bg
          )}
        >
          <span className="font-display text-4xl font-bold text-foreground">
            {displayScore}%
          </span>
        </div>
        <span
          className={cn(
            "inline-block px-4 py-1.5 rounded-full text-sm font-body font-medium",
            colors.bg,
            colors.text
          )}
        >
          {tier}
        </span>
      </div>

      <h1 className="font-display text-2xl md:text-3xl font-semibold text-foreground">
        {userName}'s Life Readiness Report
      </h1>
    </div>
  );
};

export default ReportHeader;
