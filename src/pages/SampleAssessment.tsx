import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, X, Check, AlertTriangle, X as XIcon, Sparkles } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { cn } from "@/lib/utils";

// Sample uses first 3 questions from the full assessment
const sampleQuestions = [
  {
    id: "someone-test",
    question: "Is there at least one person who would know they're supposed to step in if something happened to you?",
    insight: "This reveals whether you have role clarity — someone who knows they're the one.",
  },
  {
    id: "location-test",
    question: "Would that person know where to look first to find your important information?",
    insight: "This exposes the 'it's in my head' risk — when knowledge isn't accessible.",
  },
  {
    id: "access-test",
    question: "Could that person actually access what they find (logins, passwords, physical access)?",
    insight: "This separates 'I told them' from 'they can actually act.'",
  },
];

type AnswerValue = "yes" | "somewhat" | "no";

const answerOptions: { value: AnswerValue; label: string; icon: typeof Check; score: number }[] = [
  { value: "yes", label: "Yes", icon: Check, score: 10 },
  { value: "somewhat", label: "Somewhat / Not sure", icon: AlertTriangle, score: 5 },
  { value: "no", label: "No", icon: XIcon, score: 0 },
];

const SampleAssessment = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [isComplete, setIsComplete] = useState(false);

  const totalSteps = sampleQuestions.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;
  const currentQuestion = sampleQuestions[currentStep];

  const handleAnswer = (answer: AnswerValue) => {
    const newAnswers = { ...answers, [currentQuestion.id]: answer };
    setAnswers(newAnswers);

    // Auto-advance after brief delay
    setTimeout(() => {
      if (currentStep < totalSteps - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        setIsComplete(true);
      }
    }, 300);
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate(-1);
    }
  };

  // Calculate estimated score
  const calculateEstimatedScore = () => {
    const answered = Object.values(answers).length;
    if (answered === 0) return 65;
    
    const rawScore = Object.values(answers).reduce((sum, answer) => {
      const option = answerOptions.find(o => o.value === answer);
      return sum + (option?.score || 0);
    }, 0);
    
    const maxSampleScore = sampleQuestions.length * 10;
    return Math.round((rawScore / maxSampleScore) * 100);
  };

  const selectedAnswer = answers[currentQuestion?.id];

  if (isComplete) {
    const estimatedScore = calculateEstimatedScore();
    
    return (
      <AppLayout hideBottomNav>
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-hero">
          <div className="max-w-md text-center space-y-6 animate-fade-up">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Sparkles className="h-10 w-10 text-primary" />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Great Start!
            </h1>
            <p className="text-muted-foreground font-body">
              Based on your sample answers, here's a preview. Take the full 2-minute assessment to get your complete Findability Score.
            </p>
            
            <div className="bg-card rounded-xl p-6 shadow-card border border-border/50">
              <div className="text-sm text-muted-foreground font-body mb-2">
                Estimated Score Preview
              </div>
              <div className="text-4xl font-display font-bold text-primary mb-2">
                {estimatedScore}%
              </div>
              <p className="text-xs text-muted-foreground font-body">
                Complete the full assessment for your actual score
              </p>
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <Button
                size="lg"
                onClick={() => navigate("/assessment")}
                className="font-body font-medium press-effect"
              >
                Take Full Assessment
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate("/")}
                className="font-body text-muted-foreground"
              >
                Return Home
              </Button>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout hideBottomNav>
      <div className="min-h-screen flex flex-col bg-background">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
          <div className="flex items-center justify-between p-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="font-body text-sm font-medium">Sample Assessment</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Progress value={progress} className="h-1 rounded-none" />
        </header>

        {/* Question Content */}
        <div className="flex-1 flex flex-col justify-center p-6 max-w-2xl mx-auto w-full">
          <div className="space-y-8 animate-page-enter">
            <div className="text-center space-y-4">
              <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-body font-medium">
                Question {currentStep + 1} of {totalSteps}
              </span>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground leading-tight">
                {currentQuestion.question}
              </h2>
              <p className="text-sm text-muted-foreground font-body italic">
                {currentQuestion.insight}
              </p>
            </div>

            <div className="space-y-3">
              {answerOptions.map(({ value, label, icon: Icon }) => {
                const isSelected = selectedAnswer === value;
                
                return (
                  <button
                    key={value}
                    onClick={() => handleAnswer(value)}
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
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default SampleAssessment;
