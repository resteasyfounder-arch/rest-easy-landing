import { cn } from "@/lib/utils";
import { Check, Scale, Wallet, Heart, Key, User, Users, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SectionCompleteProps {
  sectionId: string;
  sectionLabel: string;
  questionsCompleted: number;
  onContinue: () => void;
  className?: string;
}

const sectionIcons: Record<string, React.ElementType> = {
  legal: Scale,
  financial: Wallet,
  healthcare: Heart,
  digital: Key,
  personal: User,
  family: Users,
  default: FileText,
};

const SectionComplete = ({
  sectionId,
  sectionLabel,
  questionsCompleted,
  onContinue,
  className,
}: SectionCompleteProps) => {
  const Icon = sectionIcons[sectionId] || sectionIcons.default;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center space-y-6 py-12 px-6",
        className
      )}
    >
      {/* Success Icon */}
      <div className="relative">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <Icon className="w-10 h-10 text-primary" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg animate-check-pop">
          <Check className="w-5 h-5 text-primary-foreground" />
        </div>
      </div>

      {/* Message */}
      <div className="space-y-2 max-w-sm">
        <h2 className="font-display text-2xl font-semibold text-foreground">
          {sectionLabel} Complete
        </h2>
        <p className="text-muted-foreground font-body text-sm">
          You've answered all {questionsCompleted} questions in this section.
        </p>
      </div>

      {/* Action */}
      <Button onClick={onContinue} className="mt-4">
        Continue to Next Section
      </Button>
    </div>
  );
};

export default SectionComplete;
