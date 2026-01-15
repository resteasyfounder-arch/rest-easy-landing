import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import SectionNode, { SectionStatus } from "./SectionNode";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface Section {
  id: string;
  label: string;
}

interface SectionProgress {
  completed: number;
  total: number;
}

interface JourneyDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sections: Section[];
  currentSectionId: string | null;
  sectionProgress: Record<string, SectionProgress>;
  completedSections: string[];
  onSectionClick?: (sectionId: string) => void;
}

const JourneyDrawer = ({
  open,
  onOpenChange,
  sections,
  currentSectionId,
  sectionProgress,
  completedSections,
  onSectionClick,
}: JourneyDrawerProps) => {
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

  const handleSectionClick = (sectionId: string) => {
    if (onSectionClick) {
      onSectionClick(sectionId);
      onOpenChange(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="border-b border-border/50 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-primary" />
            </div>
            <div>
              <DrawerTitle className="font-display text-lg">
                Your Journey
              </DrawerTitle>
              <p className="text-xs text-muted-foreground font-body">
                {completedSections.length} of {sections.length} sections complete
              </p>
            </div>
          </div>

          {/* Overall Progress Bar */}
          <div className="mt-4">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${(completedSections.length / sections.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </DrawerHeader>

        <div className="overflow-y-auto px-4 py-4 max-h-[60vh]">
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
                    onClick={() => handleSectionClick(section.id)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default JourneyDrawer;
