import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, X, ChevronRight, Sparkles } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface CompactLifeCardProps {
  id: string;
  label: string;
  icon: LucideIcon;
  questionPrompt: string;
  currentValue: "yes" | "no" | null;
  unlockHint?: string;
  onAnswer: (value: "yes" | "no") => void;
  disabled?: boolean;
}

export function CompactLifeCard({
  id,
  label,
  icon: Icon,
  questionPrompt,
  currentValue,
  unlockHint,
  onAnswer,
  disabled = false,
}: CompactLifeCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const hasAnswer = currentValue !== null;
  const isYes = currentValue === "yes";

  const handleAnswer = (value: "yes" | "no") => {
    onAnswer(value);
    setTimeout(() => setIsOpen(false), 150);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild disabled={disabled}>
        <button
          className={cn(
            "w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200",
            "hover:bg-secondary/40 focus:outline-none focus:ring-2 focus:ring-primary/30",
            "border",
            isOpen && "bg-secondary/50 border-primary/30",
            !isOpen && hasAnswer && isYes && "bg-primary/5 border-primary/20",
            !isOpen && hasAnswer && !isYes && "bg-muted/10 border-border/20",
            !isOpen && !hasAnswer && "bg-background border-dashed border-border/30",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <div className="flex items-center gap-3">
            {/* Compact icon */}
            <div
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center transition-all",
                hasAnswer && isYes && "bg-primary/15",
                hasAnswer && !isYes && "bg-muted/30",
                !hasAnswer && "bg-muted/15"
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5 transition-colors",
                  hasAnswer && isYes && "text-primary",
                  hasAnswer && !isYes && "text-muted-foreground/70",
                  !hasAnswer && "text-muted-foreground/40"
                )}
              />
            </div>

            {/* Label */}
            <span
              className={cn(
                "font-body font-medium text-sm transition-colors",
                hasAnswer && isYes && "text-foreground",
                hasAnswer && !isYes && "text-muted-foreground",
                !hasAnswer && "text-foreground/60"
              )}
            >
              {label}
            </span>
          </div>

          {/* Status indicator */}
          <div className="flex items-center gap-2">
            {hasAnswer ? (
              isYes ? (
                <span className="flex items-center gap-1 text-xs text-primary font-medium bg-primary/10 px-2 py-0.5 rounded-full">
                  <Check className="w-3 h-3" /> Yes
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/30 px-2 py-0.5 rounded-full">
                  <X className="w-3 h-3" /> No
                </span>
              )
            ) : (
              <ChevronRight
                className={cn(
                  "w-4 h-4 text-muted-foreground/50 transition-transform",
                  isOpen && "rotate-90"
                )}
              />
            )}
          </div>
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
        <div className="px-3 pb-3 pt-2 ml-13 space-y-3">
          {/* Question prompt */}
          <p className="text-sm font-body text-foreground/70 leading-relaxed">
            {questionPrompt}
          </p>

          {/* Yes/No buttons - compact */}
          <div className="flex gap-2">
            <Button
              variant={currentValue === "yes" ? "default" : "outline"}
              size="sm"
              className={cn(
                "flex-1 h-9 font-body text-sm",
                currentValue === "yes" && "ring-1 ring-primary ring-offset-1"
              )}
              onClick={() => handleAnswer("yes")}
              disabled={disabled}
            >
              <Check className="w-3.5 h-3.5 mr-1.5" />
              Yes
            </Button>
            <Button
              variant={currentValue === "no" ? "secondary" : "outline"}
              size="sm"
              className={cn(
                "flex-1 h-9 font-body text-sm",
                currentValue === "no" && "ring-1 ring-muted-foreground/30 ring-offset-1"
              )}
              onClick={() => handleAnswer("no")}
              disabled={disabled}
            >
              <X className="w-3.5 h-3.5 mr-1.5" />
              No
            </Button>
          </div>

          {/* Unlock hint - compact */}
          {unlockHint && (
            <div className="flex items-start gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary/50 mt-0.5 shrink-0" />
              <p className="text-xs font-body text-muted-foreground/70 leading-relaxed">
                {unlockHint}
              </p>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
