import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface ProgressCircleProps {
  progress: number;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "w-20 h-20",
  md: "w-28 h-28",
  lg: "w-36 h-36",
};

const progressFontSizes = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-3xl",
};

const labelFontSizes = {
  sm: "text-[10px]",
  md: "text-xs",
  lg: "text-sm",
};

export function ProgressCircle({
  progress,
  size = "md",
  animated = true,
  className,
}: ProgressCircleProps) {
  const [displayProgress, setDisplayProgress] = useState(animated ? 0 : progress);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!animated) {
      setDisplayProgress(progress);
      return;
    }

    const duration = 800; // ms
    const startValue = displayProgress;
    
    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }
      
      const elapsed = timestamp - startTimeRef.current;
      const animProgress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic
      const eased = 1 - Math.pow(1 - animProgress, 3);
      
      const currentProgress = startValue + (progress - startValue) * eased;
      
      setDisplayProgress(currentProgress);
      
      if (animProgress < 1) {
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
  }, [progress, animated]);

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
          className="stroke-primary/70 transition-all duration-300"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      
      {/* Progress display */}
      <div className={cn(
        "flex flex-col items-center justify-center rounded-full bg-primary/10",
        size === "sm" ? "w-14 h-14" : size === "md" ? "w-20 h-20" : "w-26 h-26"
      )}>
        <span className={cn(
          "font-display font-bold text-primary",
          progressFontSizes[size]
        )}>
          {Math.round(displayProgress)}%
        </span>
        <span className={cn(
          "text-muted-foreground -mt-0.5",
          labelFontSizes[size]
        )}>
          Complete
        </span>
      </div>
    </div>
  );
}

export default ProgressCircle;
