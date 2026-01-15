import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface AnswerButtonProps {
  label: string;
  selected?: boolean;
  onClick: () => void;
  className?: string;
  showConfirmation?: boolean;
}

const AnswerButton = ({ 
  label, 
  selected, 
  onClick, 
  className,
  showConfirmation = false,
}: AnswerButtonProps) => {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      className={cn(
        "relative w-full min-h-[60px] px-6 py-4 text-base md:text-lg font-body font-normal",
        "rounded-xl border-2 transition-all duration-200",
        "hover:bg-secondary/50 hover:border-primary/30 hover:shadow-soft hover:-translate-y-0.5",
        "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        "active:scale-[0.98] active:translate-y-0",
        selected
          ? "border-primary bg-primary/8 shadow-soft text-foreground animate-selection-confirm"
          : "border-border/60 bg-card text-foreground",
        className
      )}
    >
      <span className="flex-1">{label}</span>
      
      {/* Selection Checkmark */}
      {selected && (
        <span 
          className={cn(
            "absolute right-4 top-1/2 -translate-y-1/2",
            "w-6 h-6 rounded-full bg-primary flex items-center justify-center",
            showConfirmation && "animate-check-pop"
          )}
        >
          <Check className="w-4 h-4 text-primary-foreground" />
        </span>
      )}
    </Button>
  );
};

export default AnswerButton;
