import { useNavigate } from "react-router-dom";
import { ArrowRight, RotateCcw, Shield, Brain, FolderLock, CheckCircle, Users } from "lucide-react";
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
      {/* Narrative section */}
      <div className="bg-card rounded-xl border border-border p-5 space-y-4">
        <div className="text-center space-y-2">
          <h3 className="font-display text-lg font-semibold text-foreground">
            You've taken the first step — don't stop here
          </h3>
          <p className="font-body text-sm text-muted-foreground leading-relaxed">
            Findability is just one piece of being prepared. Your full Life Readiness Score covers five critical areas to make sure your loved ones are never left guessing.
          </p>
        </div>

        {/* Value props */}
        <div className="space-y-2.5 pt-1">
          {[
            { icon: Shield, title: "Full Life Readiness Assessment", desc: "Go deeper across healthcare, finances, digital life, and more" },
            { icon: Brain, title: "Remy, your personal guide", desc: "AI-powered guidance tailored to your specific situation" },
            { icon: FolderLock, title: "EasyVault secure storage", desc: "Store and share critical documents with people you trust" },
            { icon: CheckCircle, title: "Personalized action plans", desc: "Step-by-step priorities based on your unique gaps" },
          ].map(({ icon: Icon, title, desc }, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-body text-sm font-medium text-foreground">{title}</p>
                <p className="font-body text-xs text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Social proof */}
        <div className="flex items-center justify-center gap-2 pt-2 border-t border-border/50">
          <Users className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="font-body text-xs text-muted-foreground">
            Join thousands of people getting prepared for what matters
          </span>
        </div>
      </div>

      {/* Primary CTA */}
      <Button
        size="lg"
        onClick={handleSignUp}
        className="w-full font-body font-medium press-effect gap-2 h-13 text-base bg-primary hover:bg-primary/90"
      >
        Create Your Free Account
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
