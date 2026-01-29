import { useState, useEffect, useRef, useCallback } from "react";
import { ClipboardList, Brain, Sparkles, FileText, Check, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const generatingSteps = [
  { icon: ClipboardList, label: "Gathering responses" },
  { icon: Brain, label: "Analyzing readiness" },
  { icon: Sparkles, label: "Generating insights" },
  { icon: FileText, label: "Preparing report" },
];

const reportSections = [
  { title: "Executive Summary", color: "bg-primary/20" },
  { title: "Key Strengths", color: "bg-green-500/20" },
  { title: "Areas to Address", color: "bg-amber-500/20" },
  { title: "Recommended Actions", color: "bg-blue-500/20" },
];

const ReportGenerationDemo = () => {
  const [phase, setPhase] = useState<"generating" | "preview">("generating");
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [score, setScore] = useState(0);
  const [scrollOffset, setScrollOffset] = useState(0);
  
  const intervalsRef = useRef<ReturnType<typeof setInterval>[]>([]);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearAllTimers = useCallback(() => {
    intervalsRef.current.forEach(clearInterval);
    timeoutsRef.current.forEach(clearTimeout);
    intervalsRef.current = [];
    timeoutsRef.current = [];
  }, []);

  const runCycle = useCallback(() => {
    clearAllTimers();
    
    // Reset state
    setPhase("generating");
    setCurrentStep(0);
    setProgress(0);
    setScore(0);
    setScrollOffset(0);

    const GENERATING_DURATION = 5000;

    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 2, 100));
    }, GENERATING_DURATION / 50);
    intervalsRef.current.push(progressInterval);

    // Step cycling
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => Math.min(prev + 1, generatingSteps.length - 1));
    }, GENERATING_DURATION / generatingSteps.length);
    intervalsRef.current.push(stepInterval);

    // Transition to preview phase
    const previewTimeout = setTimeout(() => {
      setPhase("preview");
      setProgress(100);
      setCurrentStep(generatingSteps.length - 1);

      // Score animation
      let currentScore = 0;
      const scoreInterval = setInterval(() => {
        currentScore += 3;
        if (currentScore >= 78) {
          setScore(78);
          clearInterval(scoreInterval);
        } else {
          setScore(currentScore);
        }
      }, 25);
      intervalsRef.current.push(scoreInterval);

      // Scroll animation after a short delay
      const scrollTimeout = setTimeout(() => {
        const scrollInterval = setInterval(() => {
          setScrollOffset((prev) => {
            const next = prev + 0.8;
            return next >= 100 ? 100 : next;
          });
        }, 40);
        intervalsRef.current.push(scrollInterval);
      }, 1000);
      timeoutsRef.current.push(scrollTimeout);
    }, GENERATING_DURATION);
    timeoutsRef.current.push(previewTimeout);
  }, [clearAllTimers]);

  useEffect(() => {
    runCycle();
    const cycleInterval = setInterval(runCycle, 12000);

    return () => {
      clearInterval(cycleInterval);
      clearAllTimers();
    };
  }, [runCycle, clearAllTimers]);

  return (
    <div 
      className="h-48 relative overflow-hidden"
      aria-hidden="true"
    >
      {/* Generating Phase */}
      <div
        className={cn(
          "absolute inset-0 flex flex-col justify-center px-4 transition-all duration-500",
          phase === "generating" ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
        )}
      >
        {/* Progress bar */}
        <div className="mb-4">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-100 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step indicators */}
        <div className="space-y-2">
          {generatingSteps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isComplete = index < currentStep;

            return (
              <div
                key={step.label}
                className={cn(
                  "flex items-center gap-2 text-xs transition-all duration-300",
                  isActive && "text-foreground",
                  isComplete && "text-primary",
                  !isActive && !isComplete && "text-muted-foreground/50"
                )}
              >
                <div
                  className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300",
                    isComplete && "bg-primary text-primary-foreground",
                    isActive && "bg-primary/20 text-primary animate-pulse",
                    !isActive && !isComplete && "bg-muted"
                  )}
                >
                  {isComplete ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <Icon className="w-3 h-3" />
                  )}
                </div>
                <span className="font-body">{step.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Preview Phase */}
      <div
        className={cn(
          "absolute inset-0 flex flex-col transition-all duration-500",
          phase === "preview" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}
      >
        {/* Score header */}
        <div className="flex items-center gap-3 p-3 border-b border-border/50">
          {/* Score circle */}
          <div className="relative w-12 h-12">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                className="stroke-muted"
                strokeWidth="3"
              />
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                className="stroke-primary"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${(score / 100) * 97.5} 97.5`}
                style={{ transition: "stroke-dasharray 0.1s ease-out" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-semibold text-foreground">{score}</span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-foreground">Life Readiness Report</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Shield className="w-3 h-3 text-primary" />
              <span className="text-xs text-primary font-medium">Well Prepared</span>
            </div>
          </div>
        </div>

        {/* Scrolling content */}
        <div className="flex-1 overflow-hidden">
          <div
            className="p-3 space-y-2"
            style={{
              transform: `translateY(-${scrollOffset}px)`,
              transition: "transform 0.05s linear",
            }}
          >
            {reportSections.map((section) => (
              <div
                key={section.title}
                className="rounded-lg p-2.5 bg-muted/30"
              >
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", section.color)} />
                  <span className="text-xs font-medium text-foreground">{section.title}</span>
                </div>
                <div className="mt-1.5 space-y-1">
                  <div className="h-1.5 bg-muted rounded-full w-full" />
                  <div className="h-1.5 bg-muted rounded-full w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportGenerationDemo;
