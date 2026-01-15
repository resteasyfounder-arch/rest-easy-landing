import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface QuestionCardProps {
  question: string;
  children?: ReactNode;
  className?: string;
}

const QuestionCard = ({ question, children, className }: QuestionCardProps) => {
  return (
    <div
      className={cn(
        "bg-card rounded-2xl shadow-soft p-6 md:p-8",
        "border border-border/30",
        className
      )}
    >
      <h2 className="font-display text-xl md:text-2xl text-foreground leading-relaxed text-center">
        {question}
      </h2>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
};

export default QuestionCard;
