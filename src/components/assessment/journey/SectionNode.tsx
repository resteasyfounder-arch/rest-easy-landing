import { cn } from "@/lib/utils";
import { Check, Scale, Wallet, Heart, Key, User, Users, FileText } from "lucide-react";

export type SectionStatus = "completed" | "current" | "upcoming";

interface SectionNodeProps {
  sectionId: string;
  label: string;
  status: SectionStatus;
  progress?: number; // 0-100 for current section
  questionsCompleted?: number;
  questionsTotal?: number;
  onClick?: () => void;
}

const sectionIcons: Record<string, React.ElementType> = {
  legal: Scale,
  financial: Wallet,
  healthcare: Heart,
  digital: Key,
  personal: User,
  family: Users,
  default: FileText,
};

const SectionNode = ({
  sectionId,
  label,
  status,
  progress = 0,
  questionsCompleted = 0,
  questionsTotal = 0,
  onClick,
}: SectionNodeProps) => {
  const Icon = sectionIcons[sectionId] || sectionIcons.default;

  return (
    <button
      onClick={onClick}
      disabled={status === "upcoming"}
      className={cn(
        "group flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-300",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        status === "completed" && "bg-primary/8 hover:bg-primary/12 cursor-pointer",
        status === "current" && "bg-primary/15 shadow-soft cursor-default",
        status === "upcoming" && "opacity-50 cursor-not-allowed"
      )}
    >
      {/* Node Circle */}
      <div
        className={cn(
          "relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300",
          status === "completed" && "bg-primary text-primary-foreground",
          status === "current" && "bg-primary text-primary-foreground animate-node-pulse",
          status === "upcoming" && "bg-muted text-muted-foreground border-2 border-dashed border-border"
        )}
      >
        {status === "completed" ? (
          <Check className="w-5 h-5" />
        ) : (
          <Icon className="w-5 h-5" />
        )}
        
        {/* Current indicator ring */}
        {status === "current" && (
          <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping-slow" />
        )}
      </div>

      {/* Label and Progress */}
      <div className="flex-1 text-left min-w-0">
        <p
          className={cn(
            "font-body text-sm font-medium truncate transition-colors",
            status === "completed" && "text-foreground",
            status === "current" && "text-foreground",
            status === "upcoming" && "text-muted-foreground"
          )}
        >
          {label}
        </p>
        
        {status === "current" && questionsTotal > 0 && (
          <div className="mt-1.5 space-y-1">
            <div className="h-1.5 bg-primary/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {questionsCompleted} of {questionsTotal}
            </p>
          </div>
        )}
        
        {status === "completed" && (
          <p className="text-xs text-primary font-medium mt-0.5">Complete</p>
        )}
      </div>
    </button>
  );
};

export default SectionNode;
