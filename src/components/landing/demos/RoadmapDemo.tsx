import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const roadmapItems = [
  { id: 1, text: "Review and update your will" },
  { id: 2, text: "Share login credentials securely" },
  { id: 3, text: "Designate a healthcare proxy" },
];

const RoadmapDemo = () => {
  const [completedIndex, setCompletedIndex] = useState(-1);
  const [animatingIndex, setAnimatingIndex] = useState(-1);

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      setCompletedIndex(0);
      return;
    }

    const cycle = () => {
      setAnimatingIndex((prev) => {
        const next = (prev + 1) % roadmapItems.length;
        
        // After animation starts, mark as completed
        setTimeout(() => {
          setCompletedIndex((prevCompleted) => {
            if (next === 0 && prevCompleted >= roadmapItems.length - 1) {
              return -1; // Reset
            }
            return next;
          });
        }, 400);
        
        return next;
      });
    };

    const timer = setInterval(cycle, 2000);
    
    // Initial trigger
    setTimeout(cycle, 800);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="p-4 min-h-[200px] flex flex-col justify-center">
      <div className="space-y-3">
        {roadmapItems.map((item, index) => {
          const isCompleted = index <= completedIndex;
          const isAnimating = index === animatingIndex;

          return (
            <div
              key={item.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl transition-all duration-300",
                "border",
                isCompleted
                  ? "bg-primary/5 border-primary/20"
                  : "bg-card border-border/50"
              )}
            >
              {/* Checkbox */}
              <div
                className={cn(
                  "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-300",
                  isCompleted
                    ? "bg-primary border-primary"
                    : "border-border bg-background"
                )}
              >
                {isCompleted && (
                  <Check
                    className={cn(
                      "w-3 h-3 text-primary-foreground",
                      isAnimating && "animate-check-pop"
                    )}
                  />
                )}
              </div>

              {/* Text */}
              <span
                className={cn(
                  "font-body text-sm transition-all duration-300",
                  isCompleted
                    ? "text-muted-foreground line-through"
                    : "text-foreground"
                )}
              >
                {item.text}
              </span>
            </div>
          );
        })}
      </div>

      {/* Progress indicator */}
      <div className="mt-4 flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{
              width: `${((completedIndex + 1) / roadmapItems.length) * 100}%`,
            }}
          />
        </div>
        <span className="font-body text-xs text-muted-foreground">
          {Math.max(0, completedIndex + 1)}/{roadmapItems.length}
        </span>
      </div>
    </div>
  );
};

export default RoadmapDemo;
