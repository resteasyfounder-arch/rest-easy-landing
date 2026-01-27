import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, FileText, Brain, Sparkles, ClipboardList } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const PROGRESS_STEPS = [
  { id: 1, label: "Gathering your responses", icon: ClipboardList, duration: 2000 },
  { id: 2, label: "Analyzing your readiness", icon: Brain, duration: 3000 },
  { id: 3, label: "Generating personalized insights", icon: Sparkles, duration: 4000 },
  { id: 4, label: "Preparing your report", icon: FileText, duration: 3000 },
];

const ReportLoading = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animate through steps
    const stepTimers: NodeJS.Timeout[] = [];
    let totalTime = 0;

    PROGRESS_STEPS.forEach((step, index) => {
      const timer = setTimeout(() => {
        setCurrentStep(index);
      }, totalTime);
      stepTimers.push(timer);
      totalTime += step.duration;
    });

    return () => stepTimers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    // Smooth progress bar animation
    const interval = setInterval(() => {
      setProgress((prev) => {
        // Progress based on current step, but never fully complete (leaves room for actual load)
        const targetProgress = Math.min(((currentStep + 1) / PROGRESS_STEPS.length) * 85, 90);
        const increment = (targetProgress - prev) * 0.1;
        return prev + Math.max(increment, 0.5);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [currentStep]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-accent/20 px-6">
      <div className="text-center space-y-8 max-w-md w-full">
        {/* Animated Icon */}
        <div className="relative mx-auto w-24 h-24">
          <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse" />
          <div className="absolute inset-2 rounded-full bg-primary/20 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        </div>

        {/* Header */}
        <div className="space-y-2">
          <h2 className="font-display text-2xl font-semibold text-foreground">
            Preparing Your Report
          </h2>
          <p className="font-body text-sm text-muted-foreground">
            Our AI is analyzing your responses to create personalized recommendations...
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {Math.round(progress)}% complete
          </p>
        </div>

        {/* Step Indicators */}
        <div className="space-y-3 text-left bg-card/50 rounded-xl p-4 border border-border/50">
          {PROGRESS_STEPS.map((step, index) => {
            const Icon = step.icon;
            const isComplete = index < currentStep;
            const isCurrent = index === currentStep;

            return (
              <div
                key={step.id}
                className={cn(
                  "flex items-center gap-3 transition-all duration-500",
                  isComplete && "opacity-60",
                  isCurrent && "opacity-100",
                  index > currentStep && "opacity-30"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
                    isComplete && "bg-emerald-100 text-emerald-600",
                    isCurrent && "bg-primary/20 text-primary",
                    index > currentStep && "bg-muted text-muted-foreground"
                  )}
                >
                  {isComplete ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : isCurrent ? (
                    <Icon className="w-4 h-4 animate-pulse" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-sm font-body transition-all duration-300",
                    isComplete && "text-muted-foreground line-through",
                    isCurrent && "text-foreground font-medium",
                    index > currentStep && "text-muted-foreground"
                  )}
                >
                  {step.label}
                  {isCurrent && (
                    <span className="ml-2 inline-flex">
                      <span className="animate-pulse">...</span>
                    </span>
                  )}
                </span>
              </div>
            );
          })}
        </div>

        {/* Reassurance */}
        <p className="text-xs text-muted-foreground/70 italic">
          This usually takes 15-30 seconds
        </p>
      </div>
    </div>
  );
};

export default ReportLoading;
