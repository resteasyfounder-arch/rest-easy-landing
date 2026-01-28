import { cn } from "@/lib/utils";
import { Clock, ClipboardList, CheckCircle2 } from "lucide-react";

interface QuickStatsStripProps {
  estimatedMinutes: number;
  questionsAnswered: number;
  questionsTotal: number;
  sectionsCompleted: number;
  sectionsTotal: number;
  className?: string;
}

const QuickStatsStrip = ({
  estimatedMinutes,
  questionsAnswered,
  questionsTotal,
  sectionsCompleted,
  sectionsTotal,
  className,
}: QuickStatsStripProps) => {
  const stats = [
    {
      icon: Clock,
      label: `~${estimatedMinutes} min left`,
    },
    {
      icon: ClipboardList,
      label: `${questionsAnswered}/${questionsTotal} questions`,
    },
    {
      icon: CheckCircle2,
      label: `${sectionsCompleted}/${sectionsTotal} sections`,
    },
  ];

  return (
    <div className={cn(
      "flex items-center justify-center gap-4 sm:gap-6 py-3 px-4 rounded-lg bg-muted/50 border border-border/50",
      className
    )}>
      {stats.map((stat, index) => (
        <div 
          key={index}
          className="flex items-center gap-1.5 text-sm text-muted-foreground"
        >
          <stat.icon className="h-4 w-4 text-primary/70" />
          <span className="whitespace-nowrap">{stat.label}</span>
        </div>
      ))}
    </div>
  );
};

export default QuickStatsStrip;
