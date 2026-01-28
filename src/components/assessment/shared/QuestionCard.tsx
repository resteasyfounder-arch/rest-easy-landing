import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface QuestionCardProps {
  question: string;
  children?: ReactNode;
  className?: string;
  // Optional flag if we want to support the old "intro" style, but defaults to clean
  isIntro?: boolean;
}

export const QuestionCard = ({ question, children, className, isIntro = false }: QuestionCardProps) => {
  return (
    <div className={cn("w-full max-w-2xl mx-auto text-center space-y-6 animate-fade-in", className)}>
      <h2 className={cn(
        "font-display text-3xl md:text-4xl font-semibold leading-tight text-foreground tracking-tight",
        isIntro && "text-4xl md:text-5xl"
      )}>
        {question}
      </h2>

      {children && (
        <div className="text-muted-foreground text-lg leading-relaxed font-body max-w-xl mx-auto">
          {children}
        </div>
      )}
    </div>
  );
};
