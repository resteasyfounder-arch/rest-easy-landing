import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface AutosaveIndicatorProps {
  show: boolean;
  className?: string;
}

const AutosaveIndicator = ({ show, className }: AutosaveIndicatorProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 text-sm font-body text-muted-foreground",
        "transition-opacity duration-300",
        visible ? "opacity-100" : "opacity-0",
        className
      )}
      aria-live="polite"
    >
      <Check className="h-3.5 w-3.5 text-primary" />
      <span>Saved</span>
    </div>
  );
};

export default AutosaveIndicator;
