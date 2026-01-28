import { cn } from "@/lib/utils";
import { useEffect, useState, useRef } from "react";

interface ProfileSummaryProps {
  yesItems: string[];
  totalItems: number;
  className?: string;
}

export function ProfileSummary({ yesItems, totalItems, className }: ProfileSummaryProps) {
  const [displayedSummary, setDisplayedSummary] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const prevSummaryRef = useRef("");

  // Build a natural language summary based on selections
  const buildSummary = (): string => {
    if (yesItems.length === 0) {
      return "Tell us about your life by answering a few questions below.";
    }

    const parts: string[] = [];

    // Map item labels to summary phrases
    const phraseMap: Record<string, string> = {
      "Family": "loved ones who depend on you",
      "Pets": "pets in your family",
      "Caregiving": "aging parents you support",
      "Home": "real estate you own",
      "Belongings": "valuable belongings",
      "Finances": "financial accounts to manage",
      "Digital Assets": "digital assets",
      "Faith & Spirituality": "spiritual practices",
    };

    yesItems.forEach((label) => {
      if (phraseMap[label]) {
        parts.push(phraseMap[label]);
      }
    });

    if (parts.length === 0) {
      return "Your life snapshot is taking shape.";
    }

    if (parts.length === 1) {
      return `Your life includes ${parts[0]}.`;
    }

    if (parts.length === 2) {
      return `Your life includes ${parts[0]} and ${parts[1]}.`;
    }

    // 3+ items: "X, Y, and Z"
    const lastPart = parts.pop();
    return `Your life includes ${parts.join(", ")}, and ${lastPart}.`;
  };

  const currentSummary = buildSummary();

  useEffect(() => {
    if (prevSummaryRef.current !== currentSummary) {
      setIsAnimating(true);
      const timeout = setTimeout(() => {
        setDisplayedSummary(currentSummary);
        setIsAnimating(false);
        prevSummaryRef.current = currentSummary;
      }, 150);
      return () => clearTimeout(timeout);
    }
  }, [currentSummary]);

  // Initialize on first render
  useEffect(() => {
    if (!displayedSummary) {
      setDisplayedSummary(currentSummary);
      prevSummaryRef.current = currentSummary;
    }
  }, []);

  return (
    <div className={cn(
      "text-center px-4 py-3 rounded-xl bg-secondary/30 backdrop-blur-sm border border-border/30",
      className
    )}>
      <p className={cn(
        "text-sm font-body text-foreground/80 leading-relaxed transition-all duration-300",
        isAnimating && "opacity-0 translate-y-1",
        !isAnimating && "opacity-100 translate-y-0"
      )}>
        {displayedSummary || currentSummary}
      </p>
    </div>
  );
}