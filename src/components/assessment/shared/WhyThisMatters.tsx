import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface WhyThisMattersProps {
  content: string;
  className?: string;
}

const WhyThisMatters = ({ content, className }: WhyThisMattersProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn("", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-1.5 text-sm font-body text-muted-foreground",
          "hover:text-foreground transition-colors duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
        )}
        aria-expanded={isOpen}
      >
        <span>Why this question?</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>
      
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-out",
          isOpen ? "max-h-40 opacity-100 mt-3" : "max-h-0 opacity-0"
        )}
      >
        <p className="text-sm font-body text-muted-foreground leading-relaxed pl-0.5">
          {content}
        </p>
      </div>
    </div>
  );
};

export default WhyThisMatters;
