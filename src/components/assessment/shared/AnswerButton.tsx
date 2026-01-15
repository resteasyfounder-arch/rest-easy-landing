import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface AnswerButtonProps {
  label: string;
  selected?: boolean;
  onClick: () => void;
  className?: string;
}

const AnswerButton = ({ label, selected, onClick, className }: AnswerButtonProps) => {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      className={cn(
        "w-full min-h-[60px] px-6 py-4 text-base md:text-lg font-body font-normal",
        "rounded-xl border-2 transition-all duration-200",
        "hover:bg-secondary/50 hover:border-primary/30",
        "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        selected
          ? "border-primary bg-primary/8 shadow-soft text-foreground"
          : "border-border/60 bg-card text-foreground",
        className
      )}
    >
      {label}
    </Button>
  );
};

export default AnswerButton;
