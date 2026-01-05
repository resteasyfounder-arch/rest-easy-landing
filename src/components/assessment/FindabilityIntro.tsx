import { Clock, FileX, User, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FindabilityIntroProps {
  onStart: () => void;
}

const badges = [
  { icon: Clock, label: "2 minutes" },
  { icon: FileX, label: "No documents required" },
  { icon: User, label: "No personal details" },
  { icon: Heart, label: "No wrong answers" },
];

const FindabilityIntro = ({ onStart }: FindabilityIntroProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-hero">
      <div className="max-w-md text-center space-y-8 animate-fade-up">
        {/* Emotional hook */}
        <p className="text-sm font-body text-primary italic">
          This isn't about doing everything. It's about making one thing easier for the people you love.
        </p>

        {/* Main headline */}
        <div className="space-y-4">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            The 2-Minute Findability Score
          </h1>
          <p className="text-lg text-muted-foreground font-body">
            If something happened tomorrow, could the right people actually find what they need?
          </p>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-3">
          {badges.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 px-3 py-2 rounded-full bg-secondary/50 border border-border/50"
            >
              <Icon className="h-4 w-4 text-primary" />
              <span className="text-xs font-body text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground font-body">
          This score measures access and clarity — not legal validity.
        </p>

        {/* CTA */}
        <Button
          size="lg"
          onClick={onStart}
          className="w-full font-body font-medium press-effect"
        >
          Start Assessment
        </Button>
      </div>
    </div>
  );
};

export default FindabilityIntro;
