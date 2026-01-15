import { cn } from "@/lib/utils";
import { ReactNode, useEffect, useState } from "react";

interface AnimatedQuestionCardProps {
  question: string;
  questionKey: string; // Used to trigger re-animation
  children?: ReactNode;
  className?: string;
}

const AnimatedQuestionCard = ({
  question,
  questionKey,
  children,
  className,
}: AnimatedQuestionCardProps) => {
  const [animationClass, setAnimationClass] = useState("animate-slide-in-right");
  const [currentKey, setCurrentKey] = useState(questionKey);

  useEffect(() => {
    if (questionKey !== currentKey) {
      // Trigger exit animation briefly, then enter animation
      setAnimationClass("animate-slide-out-left");
      
      const timer = setTimeout(() => {
        setCurrentKey(questionKey);
        setAnimationClass("animate-slide-in-right");
      }, 150);

      return () => clearTimeout(timer);
    }
  }, [questionKey, currentKey]);

  return (
    <div
      key={currentKey}
      className={cn(
        "bg-card rounded-2xl shadow-soft p-6 md:p-8",
        "border border-border/30",
        animationClass,
        className
      )}
    >
      <h2 className="font-display text-xl md:text-2xl text-foreground leading-relaxed text-center text-balance">
        {question}
      </h2>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
};

export default AnimatedQuestionCard;
