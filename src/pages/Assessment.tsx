import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import FindabilityIntro from "@/components/assessment/FindabilityIntro";
import FindabilityQuestionComponent from "@/components/assessment/FindabilityQuestion";
import FindabilityResults from "@/components/assessment/FindabilityResults";
import {
  findabilityQuestions,
  calculateScore,
  getBiggestRisk,
  type AnswerValue,
} from "@/data/findabilityQuestions";

type Step = "intro" | "questions" | "results";

const Assessment = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("intro");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [direction, setDirection] = useState<"forward" | "backward">("forward");

  const totalQuestions = findabilityQuestions.length;
  const currentQuestion = findabilityQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  const handleStart = () => {
    setStep("questions");
  };

  const handleAnswer = (answer: AnswerValue) => {
    const newAnswers = { ...answers, [currentQuestion.id]: answer };
    setAnswers(newAnswers);

    // Auto-advance after brief delay
    setTimeout(() => {
      if (currentQuestionIndex < totalQuestions - 1) {
        setDirection("forward");
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        // Save to localStorage for future use
        const score = calculateScore(newAnswers);
        const biggestRisk = getBiggestRisk(newAnswers);
        localStorage.setItem(
          "findabilityResults",
          JSON.stringify({ score, biggestRisk, answers: newAnswers, completedAt: new Date().toISOString() })
        );
        setStep("results");
      }
    }, 300);
  };

  const handleBack = () => {
    if (step === "questions" && currentQuestionIndex > 0) {
      setDirection("backward");
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else if (step === "questions" && currentQuestionIndex === 0) {
      setStep("intro");
    } else {
      navigate(-1);
    }
  };

  const handleClose = () => {
    navigate(-1);
  };

  // Intro screen
  if (step === "intro") {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col safe-area-top safe-area-bottom">
        <header className="flex items-center justify-between px-4 h-14">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="touch-target press-effect"
          >
            <X className="h-5 w-5" />
          </Button>
          <span className="font-body text-sm font-medium text-muted-foreground">
            Findability Score
          </span>
          <div className="w-10" />
        </header>
        <div className="flex-1 overflow-y-auto">
          <FindabilityIntro onStart={handleStart} />
        </div>
      </div>
    );
  }

  // Results screen
  if (step === "results") {
    const score = calculateScore(answers);
    const biggestRisk = getBiggestRisk(answers);

    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col safe-area-top safe-area-bottom">
        <header className="flex items-center justify-between px-4 h-14">
          <div className="w-10" />
          <span className="font-body text-sm font-medium text-muted-foreground">
            Your Results
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="touch-target press-effect"
          >
            <X className="h-5 w-5" />
          </Button>
        </header>
        <div className="flex-1 overflow-y-auto">
          <FindabilityResults score={score} biggestRisk={biggestRisk} />
        </div>
      </div>
    );
  }

  // Questions screen
  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col safe-area-top safe-area-bottom">
      {/* Header */}
      <header className="flex items-center justify-between px-4 h-14 border-b border-border/50">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="touch-target press-effect"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <span className="font-body text-sm font-medium text-muted-foreground">
          Findability Score
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="touch-target press-effect"
        >
          <X className="h-5 w-5" />
        </Button>
      </header>

      {/* Progress */}
      <Progress value={progress} className="h-1 rounded-none" />

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <FindabilityQuestionComponent
          key={currentQuestion.id}
          question={currentQuestion}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={totalQuestions}
          selectedAnswer={answers[currentQuestion.id]}
          onAnswer={handleAnswer}
          direction={direction}
        />
      </div>
    </div>
  );
};

export default Assessment;
