import { cn } from "@/lib/utils";
import { FileText, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import type { ReportStatus } from "@/types/assessment";

interface ReportStatusBadgeProps {
  status: ReportStatus;
  className?: string;
}

const statusConfig: Record<ReportStatus, {
  icon: typeof FileText;
  label: string;
  className: string;
}> = {
  not_started: {
    icon: FileText,
    label: "Not started",
    className: "bg-muted text-muted-foreground",
  },
  generating: {
    icon: Loader2,
    label: "Generating...",
    className: "bg-primary/10 text-primary",
  },
  ready: {
    icon: CheckCircle2,
    label: "Ready",
    className: "bg-emerald-500/10 text-emerald-600",
  },
  failed: {
    icon: AlertCircle,
    label: "Failed",
    className: "bg-destructive/10 text-destructive",
  },
};

export function ReportStatusBadge({ status, className }: ReportStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  
  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
      config.className,
      className
    )}>
      <Icon className={cn(
        "h-3.5 w-3.5",
        status === "generating" && "animate-spin"
      )} />
      <span>{config.label}</span>
    </div>
  );
}

export default ReportStatusBadge;
