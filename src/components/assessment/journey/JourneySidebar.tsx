import { cn } from "@/lib/utils";
import SectionNode, { SectionStatus } from "./SectionNode";
import { MapPin } from "lucide-react";

interface Section {
  id: string;
  label: string;
}

interface SectionProgress {
  completed: number;
  total: number;
}

interface JourneySidebarProps {
  sections: Section[];
  currentSectionId: string | null;
  sectionProgress: Record<string, SectionProgress>;
  completedSections: string[];
  className?: string;
  onSectionClick?: (sectionId: string) => void;
}

const JourneySidebar = ({
  sections,
  currentSectionId,
  sectionProgress,
  completedSections,
  className,
  onSectionClick,
}: JourneySidebarProps) => {
  const getSectionStatus = (sectionId: string): SectionStatus => {
    if (completedSections.includes(sectionId)) return "completed";
    if (sectionId === currentSectionId) return "current";
    return "upcoming";
  };

  const getSectionProgressPercent = (sectionId: string): number => {
    const progress = sectionProgress[sectionId];
    if (!progress || progress.total === 0) return 0;
    return Math.round((progress.completed / progress.total) * 100);
  };

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col w-72 lg:w-80 bg-card border-r border-border/50 p-6",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <MapPin className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground">
            Your Journey
          </h2>
          <p className="text-xs text-muted-foreground font-body">
            {completedSections.length} of {sections.length} sections
          </p>
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div className="mb-6">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${(completedSections.length / sections.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Section List with Path */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-1">
          {sections.map((section, index) => {
            const status = getSectionStatus(section.id);
            const progress = sectionProgress[section.id];
            const isLast = index === sections.length - 1;

            return (
              <div key={section.id} className="relative">
                {/* Connector Line */}
                {!isLast && (
                  <div
                    className={cn(
                      "absolute left-[28px] top-[52px] w-0.5 h-6 transition-colors duration-300",
                      status === "completed" || status === "current"
                        ? "bg-primary/40"
                        : "bg-border"
                    )}
                  />
                )}

                <SectionNode
                  sectionId={section.id}
                  label={section.label}
                  status={status}
                  progress={getSectionProgressPercent(section.id)}
                  questionsCompleted={progress?.completed || 0}
                  questionsTotal={progress?.total || 0}
                  onClick={onSectionClick ? () => onSectionClick(section.id) : undefined}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Message */}
      <div className="mt-6 pt-4 border-t border-border/50">
        <p className="text-xs text-muted-foreground font-body text-center italic">
          Your progress is saved automatically
        </p>
      </div>
    </aside>
  );
};

export default JourneySidebar;
