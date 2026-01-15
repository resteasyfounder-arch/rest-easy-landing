import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { X, ArrowLeft, FileText, Heart, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  GentleIntro,
  QuestionCard,
  SoftProgress,
  AnswerButton,
  WhyThisMatters,
  SkipButton,
  AutosaveIndicator,
  ReflectionMoment,
  PauseScreen,
  SectionTransition,
  CompletionScreen,
  pauseMessages,
} from "@/components/assessment/shared";
import {
  findabilityQuestions,
  calculateScore,
  sectionInfo,
  answerLabels,
  type AnswerValue,
} from "@/data/findabilityQuestions";

type Step = "intro" | "questions" | "pause" | "section-transition" | "results";

const Assessment = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("intro");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [showReflection, setShowReflection] = useState(false);
  const [lastSaved, setLastSaved] = useState(false);
  const [pauseMessageIndex, setPauseMessageIndex] = useState(0);

  const totalQuestions = findabilityQuestions.length;
  const currentQuestion = findabilityQuestions[currentQuestionIndex];

  const handleStart = () => {
    setStep("questions");
  };

  const advanceToNext = useCallback(() => {
    setShowReflection(false);
    
    if (currentQuestionIndex < totalQuestions - 1) {
      // Check if we need a pause screen
      if (currentQuestion.pauseAfter && step === "questions") {
        setPauseMessageIndex((prev) => (prev + 1) % pauseMessages.length);
        setStep("pause");
        return;
      }
      
      // Check if section is ending
      if (currentQuestion.sectionEnd && step === "questions") {
        setStep("section-transition");
        return;
      }
      
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // All done - save and show results
      const score = calculateScore(answers);
      localStorage.setItem(
        "findabilityResults",
        JSON.stringify({ score, answers, completedAt: new Date().toISOString() })
      );
      setStep("results");
    }
  }, [currentQuestionIndex, totalQuestions, currentQuestion, answers, step]);

  const handleAnswer = (answer: AnswerValue) => {
    const newAnswers = { ...answers, [currentQuestion.id]: answer };
    setAnswers(newAnswers);
    
    // Show autosave indicator
    setLastSaved(true);
    setTimeout(() => setLastSaved(false), 100);

    // Check if there's a reflection for this answer
    const reflection = currentQuestion.reflectionText?.[answer];
    if (reflection) {
      setShowReflection(true);
      setTimeout(() => advanceToNext(), 2000);
    } else {
      setTimeout(() => advanceToNext(), 400);
    }
  };

  const handleSkip = () => {
    advanceToNext();
  };

  const handlePauseContinue = () => {
    // Check if section also ends here
    if (currentQuestion.sectionEnd) {
      setStep("section-transition");
    } else {
      setStep("questions");
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleSectionContinue = () => {
    setStep("questions");
    setCurrentQuestionIndex(currentQuestionIndex + 1);
  };

  const handleBack = () => {
    if (step === "pause" || step === "section-transition") {
      setStep("questions");
      return;
    }
    if (step === "questions" && currentQuestionIndex > 0) {
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

  const handleRetake = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setStep("intro");
    setShowReflection(false);
  };

  // Get section icon based on category
  const getSectionIcon = (category: string) => {
    switch (category) {
      case "documents":
        return FileText;
      case "healthcare":
        return Heart;
      case "financial":
        return Wallet;
      default:
        return FileText;
    }
  };

  // Intro screen
  if (step === "intro") {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col safe-area-top safe-area-bottom">
        <header className="flex items-center justify-end px-4 h-14">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="touch-target press-effect"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </Button>
        </header>
        <div className="flex-1 overflow-y-auto">
          <GentleIntro
            headline="Take your time. There's no rush here."
            description="This will help us understand what matters most to you. You can pause anytime and pick up where you left off."
            subtext="About 2 minutes · Your answers are saved automatically"
            ctaLabel="Let's Begin"
            onStart={handleStart}
          />
        </div>
      </div>
    );
  }

  // Pause screen
  if (step === "pause") {
    return (
      <PauseScreen
        message={pauseMessages[pauseMessageIndex]}
        onContinue={handlePauseContinue}
        autoAdvanceMs={3500}
      />
    );
  }

  // Section transition
  if (step === "section-transition") {
    const section = sectionInfo[currentQuestion.category];
    const Icon = getSectionIcon(currentQuestion.category);
    
    return (
      <SectionTransition
        icon={Icon}
        closingMessage={section?.closingMessage || "That's helpful context."}
        nextSectionHint={section?.nextHint}
        onContinue={handleSectionContinue}
      />
    );
  }

  // Results screen
  if (step === "results") {
    const score = calculateScore(answers);

    return (
      <CompletionScreen
        headline="Thank you for taking the time."
        message="Everything you've shared helps bring peace of mind — for you and the people who matter most."
        primaryAction={{
          label: "View Your Results",
          onClick: () => navigate("/results", { state: { score, answers } }),
        }}
        secondaryAction={{
          label: "Return to Dashboard",
          onClick: () => navigate("/"),
        }}
      />
    );
  }

  // Questions screen
  const selectedAnswer = answers[currentQuestion.id];
  const reflectionText = selectedAnswer && currentQuestion.reflectionText?.[selectedAnswer];

  return (
    <div className="fixed inset-0 bg-gradient-hero z-50 flex flex-col safe-area-top safe-area-bottom">
      {/* Minimal header */}
      <header className="flex items-center justify-between px-4 h-14">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="touch-target press-effect"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1" />
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="touch-target press-effect"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </Button>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="max-w-md mx-auto space-y-8 question-enter">
          {/* Soft progress */}
          <SoftProgress
            current={currentQuestionIndex + 1}
            total={totalQuestions}
            sectionName={currentQuestion.categoryLabel}
          />

          {/* Question card */}
          <QuestionCard question={currentQuestion.question}>
            <WhyThisMatters content={currentQuestion.whyWeAsk} className="mt-4 text-center" />
          </QuestionCard>

          {/* Reflection moment (shows after answering) */}
          {reflectionText && (
            <ReflectionMoment message={reflectionText} show={showReflection} />
          )}

          {/* Answer buttons */}
          <div className="space-y-3">
            {(["yes", "somewhat", "no"] as AnswerValue[]).map((value) => (
              <AnswerButton
                key={value}
                label={answerLabels[value]}
                selected={selectedAnswer === value}
                onClick={() => handleAnswer(value)}
              />
            ))}
          </div>

          {/* Skip and autosave row */}
          <div className="flex items-center justify-between pt-2">
            <SkipButton onClick={handleSkip} />
            <AutosaveIndicator show={lastSaved} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Assessment;
