import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, ChevronRight } from "lucide-react";
import type { ReportTimeline } from "@/types/report";

interface TimelineProps {
  timeline: ReportTimeline;
}

const Timeline = ({ timeline }: TimelineProps) => {
  const phases = [
    { label: "Weeks 1-2", items: timeline.week_1_2, color: "bg-green-500" },
    { label: "Months 1-2", items: timeline.month_1_2, color: "bg-amber-500" },
    { label: "Months 3-6", items: timeline.month_3_6, color: "bg-primary" },
  ];

  return (
    <Card className="border-primary/20 bg-card shadow-soft">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <Calendar className="h-5 w-5 text-primary" />
          Suggested Timeline
        </CardTitle>
        <p className="text-sm text-muted-foreground font-body">
          A roadmap for the next 6 months
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {phases.map((phase, phaseIndex) => (
          <div key={phase.label} className="relative">
            {/* Timeline connector */}
            {phaseIndex < phases.length - 1 && (
              <div className="absolute left-[11px] top-8 bottom-0 w-0.5 bg-border" />
            )}
            
            <div className="flex gap-3">
              <div className={`w-6 h-6 rounded-full ${phase.color} flex items-center justify-center flex-shrink-0`}>
                <span className="text-white text-xs font-bold">{phaseIndex + 1}</span>
              </div>
              <div className="flex-1 space-y-2">
                <h4 className="font-body font-semibold text-sm text-foreground">
                  {phase.label}
                </h4>
                <ul className="space-y-1.5">
                  {phase.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-2">
                      <ChevronRight className="h-3 w-3 text-muted-foreground mt-1 flex-shrink-0" />
                      <span className="font-body text-xs text-muted-foreground leading-relaxed">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default Timeline;
