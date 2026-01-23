import { useGuestProfile } from "@/hooks/useGuestProfile";

interface WelcomeHeaderProps {
  className?: string;
}

export function WelcomeHeader({ className }: WelcomeHeaderProps) {
  const { profile } = useGuestProfile();
  
  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className={className}>
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
        {getGreeting()}
      </h1>
      <p className="text-muted-foreground font-body mt-1">
        Here's your readiness overview
      </p>
    </div>
  );
}

export default WelcomeHeader;
