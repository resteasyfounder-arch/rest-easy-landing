import { Heart, Calendar } from "lucide-react";
import { format } from "date-fns";

interface WelcomeHeaderProps {
  className?: string;
  userName?: string;
  assessedDate?: string;
  hasStarted?: boolean;
  isComplete?: boolean;
}

export function WelcomeHeader({
  className,
  userName,
  assessedDate,
  hasStarted = false,
  isComplete = false,
}: WelcomeHeaderProps) {
  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  // Build greeting text with optional name
  const greetingText = userName
    ? `${getGreeting()}, ${userName}`
    : hasStarted
    ? "Welcome back"
    : getGreeting();

  // Format the assessed date
  const formattedDate = assessedDate
    ? format(new Date(assessedDate), "MMM d, yyyy")
    : null;

  return (
    <div className={className}>
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Heart className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">
            {greetingText}
          </h1>
          {isComplete && formattedDate ? (
            <div className="flex items-center gap-1.5 text-muted-foreground font-body text-sm">
              <Calendar className="h-3.5 w-3.5" />
              <span>Assessed: {formattedDate}</span>
            </div>
          ) : (
            <p className="text-muted-foreground font-body text-sm">
              {isComplete
                ? "Your readiness journey is complete"
                : hasStarted
                ? "Let's continue where you left off"
                : "Ready to begin your journey?"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default WelcomeHeader;
