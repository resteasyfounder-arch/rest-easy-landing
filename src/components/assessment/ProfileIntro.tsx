import { Sparkles, Clock, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfileIntroProps {
  totalQuestions: number;
  onStart: () => void;
}

const ProfileIntro = ({ totalQuestions, onStart }: ProfileIntroProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center animate-fade-up">
      {/* Icon */}
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <UserCircle className="w-10 h-10 text-primary" />
      </div>

      {/* Heading */}
      <h1 className="font-display text-3xl font-semibold text-foreground mb-3">
        Let's Personalize Your Assessment
      </h1>

      {/* Description */}
      <p className="font-body text-muted-foreground text-base leading-relaxed max-w-sm mb-8">
        We'll ask a few quick questions about your situation to customize the assessment for you.
      </p>

      {/* Info cards */}
      <div className="w-full max-w-sm space-y-3 mb-8">
        <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50 border border-border/50">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-primary" />
          </div>
          <div className="text-left">
            <p className="font-body text-sm font-medium text-foreground">
              {totalQuestions} quick questions
            </p>
            <p className="font-body text-xs text-muted-foreground">
              About 1-2 minutes to complete
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50 border border-border/50">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div className="text-left">
            <p className="font-body text-sm font-medium text-foreground">
              Personalized experience
            </p>
            <p className="font-body text-xs text-muted-foreground">
              Questions tailored to your situation
            </p>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <Button
        size="lg"
        onClick={onStart}
        className="w-full max-w-sm font-body press-effect"
      >
        Get Started
      </Button>
    </div>
  );
};

export default ProfileIntro;
