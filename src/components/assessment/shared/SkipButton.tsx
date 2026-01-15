import { cn } from "@/lib/utils";

interface SkipButtonProps {
  onClick: () => void;
  label?: string;
  className?: string;
}

const SkipButton = ({ onClick, label = "Skip for now", className }: SkipButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "text-sm font-body text-muted-foreground",
        "hover:text-foreground transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded px-2 py-1",
        className
      )}
    >
      {label}
    </button>
  );
};

export default SkipButton;
