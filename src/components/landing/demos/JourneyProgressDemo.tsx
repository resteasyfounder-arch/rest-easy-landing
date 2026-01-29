import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Check, Scale, Wallet, Heart, Key, Users } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface JourneyNode {
  id: string;
  label: string;
  icon: LucideIcon;
}

const journeyNodes: JourneyNode[] = [
  { id: "legal", label: "Legal", icon: Scale },
  { id: "financial", label: "Financial", icon: Wallet },
  { id: "healthcare", label: "Healthcare", icon: Heart },
  { id: "digital", label: "Digital", icon: Key },
  { id: "family", label: "Family", icon: Users },
];

const JourneyProgressDemo = () => {
  const [completedCount, setCompletedCount] = useState(2);

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) return;

    const timer = setInterval(() => {
      setCompletedCount((prev) => {
        if (prev >= journeyNodes.length) {
          return 0;
        }
        return prev + 1;
      });
    }, 2500);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="p-4 min-h-[200px] flex items-center justify-center">
      <div className="flex items-center gap-2">
        {journeyNodes.map((node, index) => {
          const isCompleted = index < completedCount;
          const isCurrent = index === completedCount;
          const Icon = node.icon;

          return (
            <div key={node.id} className="flex items-center">
              {/* Node */}
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500",
                    isCompleted && "bg-primary text-primary-foreground",
                    isCurrent &&
                      "bg-primary text-primary-foreground animate-node-pulse",
                    !isCompleted &&
                      !isCurrent &&
                      "bg-muted text-muted-foreground border-2 border-dashed border-border"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 animate-check-pop" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}

                  {/* Pulse ring for current */}
                  {isCurrent && (
                    <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping-slow" />
                  )}
                </div>

                {/* Label */}
                <span
                  className={cn(
                    "font-body text-xs transition-colors duration-300",
                    isCompleted || isCurrent
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {node.label}
                </span>
              </div>

              {/* Connector line */}
              {index < journeyNodes.length - 1 && (
                <div
                  className={cn(
                    "w-4 h-0.5 mx-1 transition-all duration-500",
                    index < completedCount ? "bg-primary" : "bg-border"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default JourneyProgressDemo;
