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
      if (currentQuestion.pauseAfter && step === "questions") {
        setPauseMessageIndex((prev) => (prev + 1) % pauseMessages.length);
        setStep("pause");
        return;
      }

      if (currentQuestion.sectionEnd && step === "questions") {
        setStep("section-transition");
        return;
      }

      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
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
    setLastSaved(true);
    setTimeout(() => setLastSaved(false), 100);

    const reflection = currentQuestion.reflectionText?.[answer];
    if (reflection) {
      setShowReflection(true);
      setTimeout(() => advanceToNext(), 2000);
    } else {
      setTimeout(() => advanceToNext(), 250); // Faster transition since animations are cleaner
    }
  };

  const handleSkip = () => {
    advanceToNext();
  };

  const handlePauseContinue = () => {
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

  const getSectionIcon = (category: string) => {
    switch (category) {
      case "documents": return FileText;
      case "healthcare": return Heart;
      case "financial": return Wallet;
      default: return FileText;
    }
  };

  if (step === "intro") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 animate-fade-in">
        <GentleIntro
          headline="Take your time."
          description="There is no rush here. This assessment is designed to be gentle, helping you understand where you stand at your own pace."
          subtext="Takes about 2-3 minutes per section"
          ctaLabel="Begin Assessment"
          onStart={handleStart}
        />
        <Button variant="ghost" className="mt-8" onClick={handleClose}>
          Exit
        </Button>
      </div>
    );
  }

  if (step === "pause") {
    return (
      <PauseScreen
        message={pauseMessages[pauseMessageIndex]}
        onContinue={handlePauseContinue}
        autoAdvanceMs={3500}
      />
    );
  }

  if (step === "section-transition") {
    const section = sectionInfo[currentQuestion.category];
    const Icon = getSectionIcon(currentQuestion.category);
    return (
      <SectionTransition
        icon={Icon}
        closingMessage={section?.closingMessage || "Section complete."}
        nextSectionHint={section?.nextHint}
        onContinue={handleSectionContinue}
      />
    );
  }

  if (step === "results") {
    const score = calculateScore(answers);
    return (
      <CompletionScreen
        headline="Results Ready"
        message="We've analyzed your responses and created your personalized roadmap."
        primaryAction={{
          label: "View Report",
          onClick: () => navigate("/results", { state: { score, answers } }),
        }}
        secondaryAction={{
          label: "Back Home",
          onClick: () => navigate("/"),
        }}
      />
    );
  }

  const selectedAnswer = answers[currentQuestion.id];
  const reflectionText = selectedAnswer && currentQuestion.reflectionText?.[selectedAnswer];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Calm Header */}
      <header className="fixed top-0 left-0 right-0 h-20 flex items-center justify-between px-6 md:px-12 bg-background/80 backdrop-blur-sm z-50">
        <div className="w-24">
          {currentQuestionIndex > 0 && (
            <Button
              variant="ghost"
              onClick={handleBack}
              className="text-muted-foreground hover:text-foreground pl-0 gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          )}
        </div>

        {/* Progress Indicator */}
        <div className="flex-1 max-w-xs md:max-w-md mx-auto">
          <SoftProgress
            current={currentQuestionIndex + 1}
            total={totalQuestions}
            sectionName={currentQuestion.categoryLabel}
          />
        </div>

        <div className="w-24 flex justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Content - Centered & Focused */}
      <main className="flex-1 flex flex-col justify-center items-center p-6 pt-24 pb-12 max-w-2xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">

        <div className="w-full space-y-10">
          <QuestionCard question={currentQuestion.question}>
            <WhyThisMatters content={currentQuestion.whyWeAsk} className="mt-6 text-center text-muted-foreground/80" />
          </QuestionCard>

          {/* Reflection Moment */}
          {reflectionText && showReflection && (
            <div className="animate-fade-up">
              <ReflectionMoment message={reflectionText} show={showReflection} />
            </div>
          )}

          {/* Options Grid */}
          <div className="grid gap-3 pt-4">
            {(["yes", "somewhat", "no"] as AnswerValue[]).map((value) => (
              <AnswerButton
                key={value}
                label={answerLabels[value]}
                selected={selectedAnswer === value}
                onClick={() => handleAnswer(value)}
              />
            ))}
          </div>

          <div className="flex justify-center pt-8">
            <SkipButton onClick={handleSkip} />
          </div>
        </div>
      </main>

      <div className="fixed bottom-6 right-6">
        <AutosaveIndicator show={lastSaved} />
      </div>
    </div>
  );
};

export default Assessment;
