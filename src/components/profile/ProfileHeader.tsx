import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface ProfileHeaderProps {
  completedCount: number;
  totalCount: number;
  className?: string;
}

function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function ProfileHeader({ completedCount, totalCount, className }: ProfileHeaderProps) {
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const greeting = getTimeBasedGreeting();
  const circumference = 2 * Math.PI * 42; // radius = 42
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn("text-center space-y-4", className)}>
      {/* Avatar with circular progress ring */}
      <div className="relative inline-flex items-center justify-center">
        {/* SVG Progress Ring */}
        <svg 
          className="w-28 h-28 -rotate-90"
          viewBox="0 0 100 100"
        >
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="42"
            stroke="hsl(var(--muted))"
            strokeWidth="4"
            fill="none"
            className="opacity-30"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="42"
            stroke="hsl(var(--primary))"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        
        {/* Center Avatar */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Avatar className="w-20 h-20 border-4 border-background shadow-lg">
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-display text-xl">
              You
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Greeting and progress text */}
      <div className="space-y-1">
        <h1 className="text-2xl font-display font-bold text-foreground">
          {greeting}
        </h1>
        <p className="text-lg font-display text-foreground/80">
          Your Life Story
        </p>
      </div>

      {/* Narrative progress */}
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 backdrop-blur-sm">
        <span className="text-sm font-body text-foreground/70">
          {completedCount === totalCount ? (
            <>Your life snapshot is <span className="font-semibold text-primary">complete</span></>
          ) : (
            <>{completedCount} of {totalCount} areas reflect your life</>
          )}
        </span>
      </div>
    </div>
  );
}
