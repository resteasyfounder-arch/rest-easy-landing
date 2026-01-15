import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface Section {
  id: string;
  label: string;
}

interface JourneyHeaderProps {
  sections: Section[];
  currentSectionId: string | null;
  completedSections: string[];
  onOpenDrawer?: () => void;
  className?: string;
}

const JourneyHeader = ({
  sections,
  currentSectionId,
  completedSections,
  onOpenDrawer,
  className,
}: JourneyHeaderProps) => {
  const currentSection = sections.find((s) => s.id === currentSectionId);
  const currentIndex = sections.findIndex((s) => s.id === currentSectionId);

  return (
    <button
      onClick={onOpenDrawer}
      className={cn(
        "md:hidden flex items-center justify-between w-full px-4 py-3",
        "bg-card/80 backdrop-blur-sm border-b border-border/30",
        "touch-target press-effect",
        className
      )}
    >
      {/* Section Dots */}
      <div className="flex items-center gap-1.5">
        {sections.map((section, index) => {
          const isCompleted = completedSections.includes(section.id);
          const isCurrent = section.id === currentSectionId;

          return (
            <div
              key={section.id}
              className={cn(
                "rounded-full transition-all duration-300",
                isCompleted && "w-2 h-2 bg-primary",
                isCurrent && "w-3 h-3 bg-primary ring-2 ring-primary/30 ring-offset-1 ring-offset-background",
                !isCompleted && !isCurrent && "w-2 h-2 bg-muted-foreground/30"
              )}
            />
          );
        })}
      </div>

      {/* Current Section Label */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground font-body">
          {currentIndex + 1}/{sections.length}
        </span>
        <span className="font-body font-medium text-foreground">
          {currentSection?.label || "Assessment"}
        </span>
        <ChevronDown className="w-4 h-4 text-muted-foreground" />
      </div>
    </button>
  );
};

export default JourneyHeader;
