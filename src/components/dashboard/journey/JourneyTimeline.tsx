import { cn } from "@/lib/utils";
import JourneyNode, { type JourneyNodeStatus } from "./JourneyNode";
import type { SectionState, SectionStatus } from "@/types/assessment";

interface JourneyTimelineProps {
  sections: SectionState[];
  onSectionClick: (sectionId: string) => void;
  onContinue: (sectionId: string) => void;
  className?: string;
}

// Map assessment section status to journey node status
const mapSectionStatus = (status: SectionStatus, progress: number): JourneyNodeStatus => {
  if (status === "completed" || progress === 100) return "completed";
  if (status === "in_progress") return "current";
  if (status === "locked") return "locked";
  return "available";
};

// Generate encouraging completion messages based on section
const getCompletionMessage = (sectionId: string): string => {
  const messages: Record<string, string> = {
    legal: "Your legal affairs are documented",
    financial: "Your finances are organized",
    healthcare: "Your healthcare wishes are clear",
    digital: "Your digital legacy is secured",
    personal: "Your personal items are cataloged",
    family: "Your family connections are mapped",
  };
  return messages[sectionId] || "Section complete";
};

const JourneyTimeline = ({
  sections,
  onSectionClick,
  onContinue,
  className,
}: JourneyTimelineProps) => {
  // Find the current (in-progress or first available) section
  const currentSectionIndex = sections.findIndex(
    (s) => s.status === "in_progress" || s.status === "available"
  );

  return (
    <div className={cn("space-y-0", className)}>
      {sections.map((section, index) => {
        const nodeStatus = mapSectionStatus(section.status, section.progress);
        const isCurrent = index === currentSectionIndex;
        
        return (
          <JourneyNode
            key={section.id}
            label={section.label}
            status={isCurrent ? "current" : nodeStatus}
            progress={section.progress}
            questionsAnswered={section.questions_answered}
            questionsTotal={section.questions_total}
            score={section.score}
            completionMessage={nodeStatus === "completed" ? getCompletionMessage(section.id) : undefined}
            onClick={() => onSectionClick(section.id)}
            onContinue={isCurrent ? () => onContinue(section.id) : undefined}
            isLast={index === sections.length - 1}
          />
        );
      })}
    </div>
  );
};

export default JourneyTimeline;
