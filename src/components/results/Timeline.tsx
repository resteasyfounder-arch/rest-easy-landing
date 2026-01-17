import { Calendar } from "lucide-react";
import type { ReportTimeline } from "@/types/report";

interface TimelineProps {
  timeline: ReportTimeline;
}

const Timeline = ({ timeline }: TimelineProps) => {
  const phases = [
    { label: "Weeks 1-2", subtitle: "Quick Starts", items: timeline.week_1_2, color: "bg-green-500" },
    { label: "Months 1-2", subtitle: "Core Actions", items: timeline.month_1_2, color: "bg-amber-500" },
    { label: "Months 3-6", subtitle: "Long-term Goals", items: timeline.month_3_6, color: "bg-primary" },
  ];

  return (
    <div className="print:break-inside-avoid">
      <h2 className="font-display text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Calendar className="h-5 w-5 text-primary" />
        Suggested Timeline
      </h2>
      <p className="text-sm text-gray-600 font-body mb-6">
        A roadmap for the next 6 months
      </p>
      
      <div className="relative">
        {phases.map((phase, phaseIndex) => (
          <div key={phase.label} className="relative pb-6 last:pb-0">
            {/* Connector Line */}
            {phaseIndex < phases.length - 1 && (
              <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-gray-200" />
            )}
            
            <div className="flex gap-4">
              {/* Phase Marker */}
              <div className={`w-8 h-8 rounded-full ${phase.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                <span className="text-white text-sm font-bold">{phaseIndex + 1}</span>
              </div>
              
              {/* Phase Content */}
              <div className="flex-1 pb-4">
                <div className="mb-3">
                  <h3 className="font-body font-bold text-gray-900">{phase.label}</h3>
                  <p className="text-sm text-gray-500 font-body">{phase.subtitle}</p>
                </div>
                <ul className="space-y-2 bg-gray-50 rounded-lg p-4 border border-gray-200">
                  {phase.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 flex-shrink-0" />
                      <span className="font-body text-sm text-gray-700 leading-relaxed">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;
