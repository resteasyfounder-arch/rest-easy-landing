import { cn } from "@/lib/utils";

interface JourneyPathProps {
  segments: Array<{
    status: "completed" | "current" | "upcoming";
  }>;
  className?: string;
}

const JourneyPath = ({ segments, className }: JourneyPathProps) => {
  return (
    <div className={cn("flex flex-col items-center", className)}>
      {segments.map((segment, index) => (
        <div
          key={index}
          className={cn(
            "w-0.5 h-8 transition-all duration-500",
            segment.status === "completed" && "bg-primary",
            segment.status === "current" && "bg-gradient-to-b from-primary to-primary/30",
            segment.status === "upcoming" && "bg-border border-l border-dashed border-muted-foreground/30 w-0"
          )}
          style={{
            // Add a subtle animation delay for cascading effect
            transitionDelay: `${index * 50}ms`,
          }}
        >
          {segment.status === "upcoming" && (
            <div className="w-0.5 h-full border-l-2 border-dashed border-muted-foreground/20" />
          )}
        </div>
      ))}
    </div>
  );
};

export default JourneyPath;
