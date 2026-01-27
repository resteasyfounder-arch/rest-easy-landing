import { Heart } from "lucide-react";

interface WelcomeHeaderProps {
  className?: string;
  hasStarted?: boolean;
  isComplete?: boolean;
}

export function WelcomeHeader({ className, hasStarted = false, isComplete = false }: WelcomeHeaderProps) {
  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  // Get context-aware sub-message
  const getContextMessage = () => {
    if (isComplete) return "Your readiness journey is complete";
    if (hasStarted) return "Let's continue where you left off";
    return "Ready to begin your journey?";
  };

  return (
    <div className={className}>
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Heart className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">
            {getGreeting()}
          </h1>
          <p className="text-muted-foreground font-body text-sm">
            {getContextMessage()}
          </p>
        </div>
      </div>
    </div>
  );
}

export default WelcomeHeader;
