import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { ReportTier } from "@/types/report";
import restEasyLogo from "@/assets/rest-easy-logo.png";

interface ReportHeaderProps {
  score: number;
  tier: ReportTier;
  userName: string;
  generatedAt: string;
}

const tierColors: Record<ReportTier, { border: string; bg: string; text: string }> = {
  "Rest Easy Ready": { border: "border-green-600", bg: "bg-green-50", text: "text-green-700" },
  "Well Prepared": { border: "border-emerald-600", bg: "bg-emerald-50", text: "text-emerald-700" },
  "On Your Way": { border: "border-amber-600", bg: "bg-amber-50", text: "text-amber-700" },
  "Getting Started": { border: "border-orange-500", bg: "bg-orange-50", text: "text-orange-700" },
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
    <div className="border-b border-gray-200 pb-8">
      {/* Logo and Title */}
      <div className="flex items-center justify-between mb-6">
        <img src={restEasyLogo} alt="Rest Easy" className="h-10 print:h-8" />
        <p className="text-sm text-gray-500 font-body">
          {formattedDate}
        </p>
      </div>

      {/* Report Title */}
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Life Readiness Report
        </h1>
        <p className="text-lg text-gray-600 font-body">
          Prepared for {userName}
        </p>
      </div>
      
      {/* Score Display */}
      <div className="flex flex-col items-center gap-4">
        <div
          className={cn(
            "w-32 h-32 rounded-full flex items-center justify-center border-4 print:border-2",
            colors.border,
            colors.bg
          )}
        >
          <div className="text-center">
            <span className="font-display text-4xl font-bold text-gray-900 block">
              {displayScore}
            </span>
            <span className="text-sm text-gray-500 font-body">out of 100</span>
          </div>
        </div>
        
        <div
          className={cn(
            "inline-flex items-center px-4 py-2 rounded-full text-sm font-body font-semibold",
            colors.bg,
            colors.text
          )}
        >
          {tier}
        </div>
      </div>
    </div>
  );
};

export default ReportHeader;
