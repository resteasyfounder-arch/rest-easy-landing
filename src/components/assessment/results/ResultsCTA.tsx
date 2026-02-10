import { useNavigate } from "react-router-dom";
import { ArrowRight, Shield, Lock, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResultsCTAProps {
  onRetake?: () => void;
}

const ResultsCTA = ({ onRetake }: ResultsCTAProps) => {
  const navigate = useNavigate();

  const handleSignUp = () => {
    navigate("/login");
  };

  const handleRetake = () => {
    if (onRetake) {
      onRetake();
    } else {
      navigate("/assessment");
    }
  };

  return (
    <div className="space-y-4 pt-2 text-center">
      {/* Primary CTA */}
      <Button
        size="lg"
        onClick={handleSignUp}
        className="w-full max-w-sm mx-auto font-body font-medium press-effect gap-2 h-13 text-base bg-primary hover:bg-primary/90"
      >
        Create Your Free Account
        <ArrowRight className="h-4 w-4" />
      </Button>

      {/* Trust indicators */}
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Shield className="w-3.5 h-3.5" />
          <span className="text-xs font-body">Bank-level encryption</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Lock className="w-3.5 h-3.5" />
          <span className="text-xs font-body">Private & secure</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />
          <span className="text-xs font-body">~15 min to get started</span>
        </div>
      </div>

      {/* Retake link */}
      <button
        onClick={handleRetake}
        className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
      >
        Retake Assessment
      </button>
    </div>
  );
};

export default ResultsCTA;
