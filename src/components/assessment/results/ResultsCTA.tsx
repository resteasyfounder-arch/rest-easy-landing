import { useNavigate } from "react-router-dom";
import { ArrowRight, RotateCcw, Shield, Brain, FolderLock } from "lucide-react";
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
    <div className="space-y-4 pt-4">
      {/* Value proposition */}
      <div className="bg-card rounded-xl border border-border p-4 space-y-3">
        <h3 className="font-display text-base font-semibold text-foreground text-center">
          What you unlock with a free account
        </h3>
        <div className="space-y-2">
          {[
            { icon: Shield, text: "Full Life Readiness Assessment across 5 categories" },
            { icon: Brain, text: "Remy, your personal AI guide for every step" },
            { icon: FolderLock, text: "EasyVault — secure document storage for your loved ones" },
          ].map(({ icon: Icon, text }, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <Icon className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="font-body text-sm text-foreground/80">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Primary CTA */}
      <Button
        size="lg"
        onClick={handleSignUp}
        className="w-full font-body font-medium press-effect gap-2 h-12"
      >
        Unlock Your Full Life Readiness Score
        <ArrowRight className="h-4 w-4" />
      </Button>

      {/* Retake */}
      <Button
        variant="ghost"
        size="lg"
        onClick={handleRetake}
        className="w-full font-body gap-2 text-muted-foreground"
      >
        <RotateCcw className="h-4 w-4" />
        Retake Assessment
      </Button>
    </div>
  );
};

export default ResultsCTA;
