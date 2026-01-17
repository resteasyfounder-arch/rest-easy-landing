import type { ReportTimeline, TimelineItem } from "@/types/report";

interface TimelineProps {
  timeline: ReportTimeline;
}

const Timeline = ({ timeline }: TimelineProps) => {
  const phases = [
    { label: "Within the Next 1-2 Weeks", subtitle: "Initial Triage & Conversations", items: timeline.week_1_2 },
    { label: "Within the Next 1-2 Months", subtitle: "Legal & Home Foundation", items: timeline.month_1_2 },
    { label: "Within the Next 3-6 Months", subtitle: "Deeper Dive & Ongoing Maintenance", items: timeline.month_3_6 },
  ];

  return (
    <section className="mb-12 print:break-inside-avoid">
      <h2 className="font-display text-2xl font-bold text-gray-900 mb-2 pb-2 border-b border-gray-200">
        Practical Timeline
      </h2>
      <p className="font-body text-gray-600 mb-8">
        To tackle these remaining areas:
      </p>
      
      <div className="space-y-10">
        {phases.map((phase, phaseIndex) => (
          <div key={phase.label} className="print:break-inside-avoid">
            <h3 className="font-display text-xl font-bold text-gray-900 mb-1">
              {phase.label}
            </h3>
            <p className="font-body text-gray-500 text-sm mb-4 italic">
              {phase.subtitle}
            </p>
            
            <ul className="space-y-3">
              {phase.items.map((item: string | TimelineItem, itemIndex: number) => {
                const title = typeof item === 'string' ? item : item.title;
                const description = typeof item === 'string' ? null : item.description;
                
                return (
                  <li key={itemIndex} className="font-body text-gray-700 leading-relaxed">
                    <span className="font-semibold text-gray-900">• {title}</span>
                    {description && (
                      <span className="text-gray-600">: {description}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Timeline;
