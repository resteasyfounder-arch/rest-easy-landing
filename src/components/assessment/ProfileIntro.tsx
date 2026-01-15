import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfileIntroProps {
  totalQuestions: number;
  onStart: () => void;
}

const ProfileIntro = ({ totalQuestions, onStart }: ProfileIntroProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center animate-fade-up">
      {/* Icon - warm and human */}
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-8">
        <Heart className="w-10 h-10 text-primary" />
      </div>

      {/* Heading - personal, not procedural */}
      <h1 className="font-display text-3xl font-semibold text-foreground mb-4">
        Before we begin
      </h1>

      {/* Description - warm, reassuring, human */}
      <p className="font-body text-muted-foreground text-lg leading-relaxed max-w-sm mb-4">
        We'd like to understand a little about your life — your family, your home, what matters to you.
      </p>

      <p className="font-body text-muted-foreground text-base leading-relaxed max-w-sm mb-8">
        There are no right or wrong answers. Just answer honestly, and skip anything that doesn't feel relevant.
      </p>

      {/* Helper text - reassuring */}
      <p className="font-body text-sm text-muted-foreground/70 mb-6">
        Takes about a minute. You can always change your answers later.
      </p>

      {/* CTA Button */}
      <Button
        size="lg"
        onClick={onStart}
        className="w-full max-w-sm font-body press-effect"
      >
        Let's Begin
      </Button>
    </div>
  );
};

export default ProfileIntro;
