import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import type { ScoreTier } from "@/types/assessment";

interface ScoreCircleProps {
  score: number;
  tier: ScoreTier;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
  className?: string;
}

const tierColors: Record<ScoreTier, string> = {
  "Getting Started": "text-amber-500",
  "On Your Way": "text-yellow-500",
  "Well Prepared": "text-emerald-500",
  "Rest Easy Ready": "text-primary",
};

const tierBgColors: Record<ScoreTier, string> = {
  "Getting Started": "bg-amber-500/10",
  "On Your Way": "bg-yellow-500/10",
  "Well Prepared": "bg-emerald-500/10",
  "Rest Easy Ready": "bg-primary/10",
};

const tierStrokeColors: Record<ScoreTier, string> = {
  "Getting Started": "stroke-amber-500",
  "On Your Way": "stroke-yellow-500",
  "Well Prepared": "stroke-emerald-500",
  "Rest Easy Ready": "stroke-primary",
};

const sizeClasses = {
  sm: "w-20 h-20",
  md: "w-28 h-28",
  lg: "w-36 h-36",
};

const scoreFontSizes = {
  sm: "text-xl",
  md: "text-3xl",
  lg: "text-4xl",
};

export function ScoreCircle({
  score,
  tier,
  size = "md",
  animated = true,
  className,
}: ScoreCircleProps) {
  const [displayScore, setDisplayScore] = useState(animated ? 0 : score);
  const [displayProgress, setDisplayProgress] = useState(animated ? 0 : score);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!animated) {
      setDisplayScore(score);
      setDisplayProgress(score);
      return;
    }

    const duration = 800; // ms
    const startValue = displayScore;
    const startProgress = displayProgress;
    
    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }
      
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      
      const currentScore = Math.round(startValue + (score - startValue) * eased);
      const currentProgress = startProgress + (score - startProgress) * eased;
      
      setDisplayScore(currentScore);
      setDisplayProgress(currentProgress);
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    
    startTimeRef.current = null;
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [score, animated]);

  // SVG circle calculations
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (displayProgress / 100) * circumference;

  return (
    <div className={cn("relative flex items-center justify-center", sizeClasses[size], className)}>
      {/* Background circle */}
      <svg className="absolute inset-0 w-full h-full -rotate-90">
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          fill="none"
          className="stroke-muted"
          strokeWidth="8"
        />
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          fill="none"
          className={cn("transition-all duration-300", tierStrokeColors[tier])}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      
      {/* Score display */}
      <div className={cn(
        "flex flex-col items-center justify-center rounded-full",
        tierBgColors[tier],
        size === "sm" ? "w-14 h-14" : size === "md" ? "w-20 h-20" : "w-26 h-26"
      )}>
        <span className={cn(
          "font-display font-bold",
          tierColors[tier],
          scoreFontSizes[size]
        )}>
          {displayScore}
        </span>
        {size !== "sm" && (
          <span className="text-xs text-muted-foreground -mt-1">/ 100</span>
        )}
      </div>
    </div>
  );
}

export default ScoreCircle;
