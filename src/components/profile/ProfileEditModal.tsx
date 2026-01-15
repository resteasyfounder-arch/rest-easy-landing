import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface ProfileEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  icon: LucideIcon;
  label: string;
  questionPrompt: string;
  currentValue: "yes" | "no" | null;
  onAnswer: (value: "yes" | "no") => void;
}

const QUESTION_PROMPTS: Record<string, string> = {
  "profile.household.has_dependents": "Do other people depend on you for care or financial support?",
  "profile.pets.has_pets": "Do you have pets that are part of your family?",
  "profile.family.supports_aging_parent": "Are you caring for or supporting an aging parent?",
  "profile.home.owns_real_property": "Do you own a home or other real estate?",
  "profile.home.has_significant_personal_property": "Do you have valuable belongings or collections?",
  "profile.financial.has_beneficiary_accounts": "Do you have retirement accounts, life insurance, or investment accounts?",
  "profile.digital.owns_crypto": "Do you own cryptocurrency or significant digital assets?",
  "profile.emotional.has_spiritual_practices": "Do you have spiritual or religious traditions important to you?",
};

export function ProfileEditModal({
  open,
  onOpenChange,
  icon: Icon,
  label,
  questionPrompt,
  currentValue,
  onAnswer,
}: ProfileEditModalProps) {
  const handleAnswer = (value: "yes" | "no") => {
    onAnswer(value);
    // Small delay before closing for visual feedback
    setTimeout(() => onOpenChange(false), 150);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center pb-2">
          <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Icon className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="font-display text-xl text-center">
            {label}
          </DialogTitle>
          <DialogDescription className="font-body text-base text-foreground/80 text-center pt-2 leading-relaxed">
            {questionPrompt}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            variant={currentValue === "yes" ? "default" : "outline"}
            size="lg"
            className={cn(
              "flex-1 h-14 text-base font-body transition-all duration-200",
              currentValue === "yes" && "ring-2 ring-primary ring-offset-2"
            )}
            onClick={() => handleAnswer("yes")}
          >
            Yes
          </Button>
          <Button
            variant={currentValue === "no" ? "default" : "outline"}
            size="lg"
            className={cn(
              "flex-1 h-14 text-base font-body transition-all duration-200",
              currentValue === "no" && "ring-2 ring-primary ring-offset-2"
            )}
            onClick={() => handleAnswer("no")}
          >
            No
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground font-body pt-2">
          You can always change this later.
        </p>
      </DialogContent>
    </Dialog>
  );
}

export { QUESTION_PROMPTS };
