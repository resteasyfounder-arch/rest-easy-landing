import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const questions = [
  {
    text: "Do you have an up-to-date will?",
    options: ["Yes", "Partially", "No"],
    selectedIndex: 0,
  },
  {
    text: "Can your family find important documents quickly?",
    options: ["Yes", "Some of them", "Not sure"],
    selectedIndex: 1,
  },
  {
    text: "Is your healthcare directive accessible?",
    options: ["Yes", "Working on it", "No"],
    selectedIndex: 0,
  },
];

const QuestionFlowDemo = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      setSelectedAnswer(questions[0].selectedIndex);
      return;
    }

    // Auto-select answer after delay
    const selectTimer = setTimeout(() => {
      setSelectedAnswer(questions[currentIndex].selectedIndex);
    }, 1200);

    // Transition to next question
    const transitionTimer = setTimeout(() => {
      setIsTransitioning(true);
    }, 3200);

    const nextTimer = setTimeout(() => {
      setSelectedAnswer(null);
      setCurrentIndex((prev) => (prev + 1) % questions.length);
      setIsTransitioning(false);
    }, 3600);

    return () => {
      clearTimeout(selectTimer);
      clearTimeout(transitionTimer);
      clearTimeout(nextTimer);
    };
  }, [currentIndex]);

  const currentQuestion = questions[currentIndex];

  return (
    <div className="p-4 min-h-[200px] flex flex-col justify-center">
      {/* Question */}
      <div
        className={cn(
          "transition-all duration-300 will-change-transform",
          isTransitioning
            ? "opacity-0 -translate-y-2"
            : "opacity-100 translate-y-0"
        )}
      >
        <p className="font-display text-base text-foreground text-center mb-4 leading-snug">
          {currentQuestion.text}
        </p>

        {/* Answer Options */}
        <div className="space-y-2">
          {currentQuestion.options.map((option, index) => (
            <div
              key={option}
              className={cn(
                "relative flex items-center justify-between",
                "px-4 py-3 rounded-xl border-2 transition-all duration-200",
                "font-body text-sm",
                selectedAnswer === index
                  ? "border-primary bg-primary/8 text-foreground"
                  : "border-border/60 bg-card text-muted-foreground"
              )}
            >
              <span>{option}</span>
              {selectedAnswer === index && (
                <span className="w-5 h-5 rounded-full bg-primary flex items-center justify-center animate-check-pop">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Progress Dots */}
      <div className="flex justify-center gap-1.5 mt-4">
        {questions.map((_, index) => (
          <div
            key={index}
            className={cn(
              "w-1.5 h-1.5 rounded-full transition-all duration-300",
              index === currentIndex ? "bg-primary w-4" : "bg-border"
            )}
          />
        ))}
      </div>
    </div>
  );
};

export default QuestionFlowDemo;
