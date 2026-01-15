import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface PauseScreenProps {
  message: string;
  onContinue: () => void;
  autoAdvanceMs?: number;
  className?: string;
}

const pauseMessages = [
  "You've covered something important.",
  "That's a meaningful step.",
  "These details matter more than you might think.",
  "Taking this time is valuable.",
  "This brings clarity to what matters.",
];

const PauseScreen = ({
  message,
  onContinue,
  autoAdvanceMs = 3000,
  className,
}: PauseScreenProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + (100 / (autoAdvanceMs / 50));
      });
    }, 50);

    const timer = setTimeout(onContinue, autoAdvanceMs);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [onContinue, autoAdvanceMs]);

  return (
    <div
      className={cn(
        "min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-hero",
        className
      )}
      onClick={onContinue}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onContinue()}
      aria-label="Tap to continue"
    >
      <div className="max-w-sm text-center space-y-8 animate-fade-up">
        {/* Breathing dots */}
        <div className="flex justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary/40 animate-pulse" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 rounded-full bg-primary/40 animate-pulse" style={{ animationDelay: "300ms" }} />
          <div className="w-2 h-2 rounded-full bg-primary/40 animate-pulse" style={{ animationDelay: "600ms" }} />
        </div>

        {/* Message */}
        <p className="font-display text-xl md:text-2xl text-foreground leading-relaxed">
          {message}
        </p>

        {/* Subtle progress indicator */}
        <div className="w-24 mx-auto h-0.5 bg-secondary/40 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary/30 rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-xs font-body text-muted-foreground/60">
          Tap to continue
        </p>
      </div>
    </div>
  );
};

export { pauseMessages };
export default PauseScreen;
