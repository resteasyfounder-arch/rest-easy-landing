import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  GentleIntro,
  QuestionCard,
  SoftProgress,
  AnswerButton,
  WhyThisMatters,
  
  AutosaveIndicator,
  ReflectionMoment,
} from "@/components/assessment/shared";
import {
  findabilityQuestions,
  calculateScore,
  answerLabels,
  type AnswerValue,
} from "@/data/findabilityQuestions";
import { supabase } from "@/integrations/supabase/client";
import FindabilityResults from "@/components/assessment/FindabilityResults";
import GeneratingScreen from "@/components/assessment/GeneratingScreen";

const RESULTS_KEY = "rest-easy.findability-results";
const PROGRESS_KEY = "rest-easy.findability-progress";

type Step = "intro" | "questions" | "generating" | "results";

interface AiSummary {
  summary: string;
  top_priority: string;
  encouragement: string;
}

const Assessment = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("intro");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [showReflection, setShowReflection] = useState(false);
  const [lastSaved, setLastSaved] = useState(false);
  const [aiSummary, setAiSummary] = useState<AiSummary | null>(null);

  const totalQuestions = findabilityQuestions.length;
  const currentQuestion = findabilityQuestions[currentQuestionIndex];

  // Restore cached results or in-progress answers on mount
  useEffect(() => {
    try {
      const cachedResults = sessionStorage.getItem(RESULTS_KEY);
      if (cachedResults) {
        const parsed = JSON.parse(cachedResults);
        setAnswers(parsed.answers);
        setAiSummary(parsed.aiSummary);
        setStep("results");
        return;
      }

      const cachedProgress = sessionStorage.getItem(PROGRESS_KEY);
      if (cachedProgress) {
        const parsed = JSON.parse(cachedProgress);
        setAnswers(parsed.answers);
        setCurrentQuestionIndex(parsed.currentQuestionIndex);
        setStep("questions");
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  const handleStart = () => {
    setStep("questions");
  };

  // Generate AI summary when entering "generating" step
  useEffect(() => {
    if (step !== "generating") return;

    const generateSummary = async () => {
      const score = calculateScore(answers);
      const questionsPayload = findabilityQuestions.map((q) => ({
        id: q.id,
        question: q.question,
        categoryLabel: q.categoryLabel,
      }));

      let summary: AiSummary;
      try {
        const { data, error } = await supabase.functions.invoke(
          "generate-findability-summary",
          { body: { answers, score, questions: questionsPayload } }
        );
        if (error) throw error;
        summary = data;
      } catch (e) {
        console.error("Failed to generate summary:", e);
        summary = {
          summary:
            "You've taken a meaningful first step by completing this assessment. Your answers reveal areas where a little organization could make a big difference for the people who matter most to you.",
          top_priority:
            "Start by making sure your trusted person knows where to find your most critical documents.",
          encouragement:
            "The fact that you're thinking about this puts you ahead of most people.",
        };
      }

      setAiSummary(summary);

      // Cache completed results
      const finalScore = calculateScore(answers);
      try {
        sessionStorage.setItem(
          RESULTS_KEY,
          JSON.stringify({ answers, aiSummary: summary, score: finalScore, completedAt: new Date().toISOString() })
        );
        sessionStorage.removeItem(PROGRESS_KEY);
      } catch { /* ignore */ }

      localStorage.setItem(
        "findabilityResults",
        JSON.stringify({ score: finalScore, answers, completedAt: new Date().toISOString() })
      );
      setStep("results");
    };

    generateSummary();
  }, [step, answers]);

  const advanceToNext = useCallback(() => {
    setShowReflection(false);

    if (currentQuestionIndex < totalQuestions - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);

      // Cache progress
      try {
        sessionStorage.setItem(
          PROGRESS_KEY,
          JSON.stringify({ answers, currentQuestionIndex: nextIndex })
        );
      } catch { /* ignore */ }
    } else {
      setStep("generating");
    }
  }, [currentQuestionIndex, totalQuestions, answers]);

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
      setTimeout(() => advanceToNext(), 400);
    }
  };




  const handleBack = () => {
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
    setAiSummary(null);
    setStep("intro");
    setShowReflection(false);
    try {
      sessionStorage.removeItem(RESULTS_KEY);
      sessionStorage.removeItem(PROGRESS_KEY);
    } catch { /* ignore */ }
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

  // Generating screen
  if (step === "generating") {
    return <GeneratingScreen />;
  }

  // Results screen (inline)
  if (step === "results") {
    const score = calculateScore(answers);
    return (
      <div className="fixed inset-0 bg-background z-50 overflow-y-auto safe-area-top safe-area-bottom">
        <FindabilityResults
          score={score}
          answers={answers}
          onRetake={handleRetake}
          aiSummary={aiSummary ?? undefined}
        />
      </div>
    );
  }

  // Questions screen
  const selectedAnswer = answers[currentQuestion.id];
  const reflectionText = selectedAnswer && currentQuestion.reflectionText?.[selectedAnswer];

  return (
    <div className="fixed inset-0 bg-gradient-hero z-50 flex flex-col safe-area-top safe-area-bottom">
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

      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="max-w-md mx-auto space-y-8 question-enter">
          <SoftProgress
            current={currentQuestionIndex + 1}
            total={totalQuestions}
            sectionName={currentQuestion.categoryLabel}
          />

          <QuestionCard question={currentQuestion.question}>
            <WhyThisMatters content={currentQuestion.whyWeAsk} className="mt-4 text-center" />
          </QuestionCard>

          {reflectionText && (
            <ReflectionMoment message={reflectionText} show={showReflection} />
          )}

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

          <div className="flex items-center justify-end pt-2">
            <AutosaveIndicator show={lastSaved} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Assessment;
