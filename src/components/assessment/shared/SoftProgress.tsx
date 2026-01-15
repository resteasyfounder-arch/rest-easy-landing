import { cn } from "@/lib/utils";

interface SoftProgressProps {
  current: number;
  total: number;
  sectionName?: string;
  className?: string;
}

const getProgressLabel = (current: number, total: number): string => {
  const ratio = current / total;
  
  if (ratio <= 0.15) return "Just getting started";
  if (ratio <= 0.35) return "Making progress";
  if (ratio <= 0.55) return "About halfway through";
  if (ratio <= 0.75) return "More than halfway";
  if (ratio <= 0.9) return "Almost there";
  return "Nearly finished";
};

const SoftProgress = ({ current, total, sectionName, className }: SoftProgressProps) => {
  const progress = Math.min((current / total) * 100, 100);
  const label = getProgressLabel(current, total);

  return (
    <div className={cn("space-y-3", className)}>
      {/* Section context badge */}
      {sectionName && (
        <div className="flex justify-center">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-secondary/60 text-xs font-body text-muted-foreground">
            {sectionName}
          </span>
        </div>
      )}
      
      {/* Natural language progress */}
      <p className="text-center text-sm font-body text-muted-foreground">
        {label}
      </p>
      
      {/* Subtle progress bar */}
      <div className="w-full max-w-xs mx-auto h-1 bg-secondary/40 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary/40 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default SoftProgress;
