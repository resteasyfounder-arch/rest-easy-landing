import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface AnswerButtonProps {
  label: string;
  selected?: boolean;
  onClick: () => void;
  className?: string;
}

export const AnswerButton = ({ label, selected, onClick, className }: AnswerButtonProps) => {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      className={cn(
        "w-full h-auto py-5 px-6 text-lg justify-between group transition-all duration-200",
        "bg-background hover:bg-secondary/40 border-border shadow-none",
        "relative overflow-hidden",
        selected && "border-primary bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary",
        className
      )}
    >
      <span className={cn(
        "font-medium tracking-tight font-body",
        selected ? "font-semibold" : "text-foreground/80"
      )}>
        {label}
      </span>

      <div className={cn(
        "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors",
        selected ? "border-primary bg-primary text-primary-foreground" : "border-border/60 group-hover:border-primary/50"
      )}>
        {selected && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
      </div>
    </Button>
  );
};

export default AnswerButton;
