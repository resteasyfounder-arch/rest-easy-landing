import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Sparkles, CheckCircle } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";

const sampleQuestions = [
  {
    id: 1,
    question: "Do you have a current will that reflects your wishes?",
    options: ["Yes, it's up to date", "Yes, but it's outdated", "No, I don't have one", "I'm not sure"],
  },
  {
    id: 2,
    question: "Have you designated beneficiaries on your financial accounts?",
    options: ["Yes, all accounts", "Some accounts", "No, none yet", "What are beneficiaries?"],
  },
  {
    id: 3,
    question: "Do your loved ones know where to find important documents?",
    options: ["Yes, everything is organized", "Somewhat", "Not really", "I haven't thought about this"],
  },
];

const SampleAssessment = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isComplete, setIsComplete] = useState(false);

  const totalSteps = sampleQuestions.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;
  const currentQuestion = sampleQuestions[currentStep];

  const handleAnswer = (answer: string) => {
    setAnswers({ ...answers, [currentQuestion.id]: answer });
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsComplete(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate(-1);
    }
  };

  const selectedAnswer = answers[currentQuestion?.id];

  if (isComplete) {
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
              Based on your sample answers, you're on the right track. Take the full assessment to get your complete Findability Score and personalized recommendations.
            </p>
            
            <div className="bg-card rounded-xl p-6 shadow-card border border-border/50">
              <div className="text-sm text-muted-foreground font-body mb-2">
                Estimated Score Preview
              </div>
              <div className="text-4xl font-display font-bold text-primary mb-2">
                65%
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
                variant="outline"
                size="lg"
                onClick={() => navigate("/login")}
                className="font-body"
              >
                Create Account to Save Progress
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
            <div className="text-sm text-muted-foreground font-body">
              {currentStep + 1} / {totalSteps}
            </div>
          </div>
          <Progress value={progress} className="h-1 rounded-none" />
        </header>

        {/* Question Content */}
        <div className="flex-1 flex flex-col justify-center p-6 max-w-2xl mx-auto w-full">
          <div className="space-y-8 animate-page-enter">
            <div className="text-center">
              <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-body font-medium mb-4">
                Question {currentStep + 1}
              </span>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                {currentQuestion.question}
              </h2>
            </div>

            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(option)}
                  className={`w-full p-4 rounded-xl border-2 text-left font-body transition-all press-effect ${
                    selectedAnswer === option
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-accent/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        selectedAnswer === option
                          ? "border-primary bg-primary"
                          : "border-muted-foreground"
                      }`}
                    >
                      {selectedAnswer === option && (
                        <CheckCircle className="h-3 w-3 text-primary-foreground" />
                      )}
                    </div>
                    <span className={selectedAnswer === option ? "text-foreground" : "text-muted-foreground"}>
                      {option}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="sticky bottom-0 p-4 bg-background/80 backdrop-blur-md border-t border-border/50 safe-area-bottom">
          <div className="max-w-2xl mx-auto">
            <Button
              size="lg"
              onClick={handleNext}
              disabled={!selectedAnswer}
              className="w-full font-body font-medium gap-2 press-effect"
            >
              {currentStep < totalSteps - 1 ? (
                <>
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  See Results
                  <Sparkles className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </footer>
      </div>
    </AppLayout>
  );
};

export default SampleAssessment;
