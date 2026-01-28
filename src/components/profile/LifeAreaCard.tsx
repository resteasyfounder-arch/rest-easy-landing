import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, X, Circle, ChevronDown, Sparkles } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface LifeAreaCardProps {
  id: string;
  label: string;
  icon: LucideIcon;
  questionPrompt: string;
  currentValue: "yes" | "no" | null;
  unlockHint?: string;
  onAnswer: (value: "yes" | "no") => void;
  disabled?: boolean;
}

export function LifeAreaCard({
  id,
  label,
  icon: Icon,
  questionPrompt,
  currentValue,
  unlockHint,
  onAnswer,
  disabled = false,
}: LifeAreaCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const hasAnswer = currentValue !== null;
  const isYes = currentValue === "yes";

  const handleAnswer = (value: "yes" | "no") => {
    onAnswer(value);
    // Auto-collapse after selection with slight delay for visual feedback
    setTimeout(() => setIsOpen(false), 200);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild disabled={disabled}>
        <button
          className={cn(
            "w-full flex items-center justify-between p-4 rounded-xl transition-all duration-300",
            "hover:bg-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2",
            "border-2",
            isOpen && "bg-secondary/50 border-primary/30 shadow-md",
            !isOpen && hasAnswer && isYes && "bg-primary/5 border-primary/20",
            !isOpen && hasAnswer && !isYes && "bg-muted/20 border-border/30",
            !isOpen && !hasAnswer && "bg-background border-dashed border-border/40",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <div className="flex items-center gap-4">
            {/* Icon container with state-based styling */}
            <div
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300",
                hasAnswer && isYes && "bg-primary/15 animate-float-gentle",
                hasAnswer && !isYes && "bg-muted/40",
                !hasAnswer && "bg-muted/20"
              )}
            >
              <Icon
                className={cn(
                  "w-6 h-6 transition-colors duration-300",
                  hasAnswer && isYes && "text-primary",
                  hasAnswer && !isYes && "text-muted-foreground",
                  !hasAnswer && "text-muted-foreground/50"
                )}
              />
            </div>

            {/* Label and status */}
            <div className="text-left">
              <p
                className={cn(
                  "font-body font-medium transition-colors",
                  hasAnswer && isYes && "text-foreground",
                  hasAnswer && !isYes && "text-muted-foreground",
                  !hasAnswer && "text-foreground/70"
                )}
              >
                {label}
              </p>
              <p className="text-sm text-muted-foreground font-body">
                {hasAnswer ? (
                  isYes ? (
                    <span className="flex items-center gap-1 text-primary">
                      <Check className="w-3 h-3" /> Part of your story
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <X className="w-3 h-3" /> Not applicable
                    </span>
                  )
                ) : (
                  <span className="flex items-center gap-1 text-muted-foreground/60">
                    <Circle className="w-3 h-3" /> Tap to answer
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Chevron indicator */}
          <ChevronDown
            className={cn(
              "w-5 h-5 text-muted-foreground transition-transform duration-300",
              isOpen && "rotate-180"
            )}
          />
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
        <div className="px-4 pb-4 pt-2 space-y-4">
          {/* Question prompt */}
          <p className="text-sm font-body text-foreground/80 leading-relaxed pl-16">
            {questionPrompt}
          </p>

          {/* Yes/No buttons */}
          <div className="flex gap-3 pl-16">
            <Button
              variant={currentValue === "yes" ? "default" : "outline"}
              size="lg"
              className={cn(
                "flex-1 h-12 font-body transition-all duration-200",
                currentValue === "yes" && "ring-2 ring-primary ring-offset-2"
              )}
              onClick={() => handleAnswer("yes")}
              disabled={disabled}
            >
              <Check className="w-4 h-4 mr-2" />
              Yes
            </Button>
            <Button
              variant={currentValue === "no" ? "secondary" : "outline"}
              size="lg"
              className={cn(
                "flex-1 h-12 font-body transition-all duration-200",
                currentValue === "no" && "ring-2 ring-muted-foreground/30 ring-offset-2"
              )}
              onClick={() => handleAnswer("no")}
              disabled={disabled}
            >
              <X className="w-4 h-4 mr-2" />
              No
            </Button>
          </div>

          {/* Unlock hint */}
          {unlockHint && (
            <div className="flex items-start gap-2 pl-16 pt-1">
              <Sparkles className="w-4 h-4 text-primary/60 mt-0.5 shrink-0" />
              <p className="text-xs font-body text-muted-foreground leading-relaxed">
                <span className="text-primary/80 font-medium">Unlocks:</span> {unlockHint}
              </p>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
