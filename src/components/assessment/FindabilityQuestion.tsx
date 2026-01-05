import { Check, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FindabilityQuestion, AnswerValue } from "@/data/findabilityQuestions";

interface FindabilityQuestionProps {
  question: FindabilityQuestion;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer: AnswerValue | undefined;
  onAnswer: (answer: AnswerValue) => void;
  direction: "forward" | "backward";
}

const answerOptions: { value: AnswerValue; label: string; icon: typeof Check }[] = [
  { value: "yes", label: "Yes", icon: Check },
  { value: "somewhat", label: "Somewhat / Not sure", icon: AlertTriangle },
  { value: "no", label: "No", icon: X },
];

const FindabilityQuestionComponent = ({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onAnswer,
  direction,
}: FindabilityQuestionProps) => {
  return (
    <div 
      className={cn(
        "flex-1 flex flex-col justify-center p-6 max-w-2xl mx-auto w-full",
        direction === "forward" ? "animate-slide-in-right" : "animate-slide-in-left"
      )}
    >
      <div className="space-y-6">
        {/* Question header */}
        <div className="text-center space-y-4">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-body font-medium">
            Question {questionNumber} of {totalQuestions}
          </span>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground leading-tight">
            {question.question}
          </h2>
        </div>

        {/* Answer options */}
        <div className="space-y-3">
          {answerOptions.map(({ value, label, icon: Icon }) => {
            const isSelected = selectedAnswer === value;
            
            return (
              <button
                key={value}
                onClick={() => onAnswer(value)}
                className={cn(
                  "w-full p-4 rounded-xl border-2 text-left font-body transition-all press-effect",
                  "flex items-center gap-4",
                  isSelected && value === "yes" && "border-green-500 bg-green-500/10",
                  isSelected && value === "somewhat" && "border-amber-500 bg-amber-500/10",
                  isSelected && value === "no" && "border-red-400 bg-red-400/10",
                  !isSelected && "border-border hover:border-primary/50 hover:bg-accent/50"
                )}
              >
                <div
                  className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center transition-colors shrink-0",
                    isSelected && value === "yes" && "bg-green-500 text-white",
                    isSelected && value === "somewhat" && "bg-amber-500 text-white",
                    isSelected && value === "no" && "bg-red-400 text-white",
                    !isSelected && "bg-secondary text-muted-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span
                  className={cn(
                    "text-base font-medium",
                    isSelected ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Why we ask - supportive text below answers */}
        <div className="pt-4 border-t border-border/30">
          <p className="text-sm text-muted-foreground font-body text-center italic">
            {question.whyWeAsk}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FindabilityQuestionComponent;
