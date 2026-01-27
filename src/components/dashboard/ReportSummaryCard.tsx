import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle2, Circle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReportMetrics } from "@/types/report";

interface ReportSummaryCardProps {
  summary: string;
  metrics?: ReportMetrics;
  onViewReport?: () => void;
  className?: string;
}

export function ReportSummaryCard({
  summary,
  metrics,
  onViewReport,
  className,
}: ReportSummaryCardProps) {
  // Truncate summary to first 2-3 sentences (roughly 200 chars)
  const truncatedSummary = summary.length > 250
    ? summary.slice(0, summary.lastIndexOf(" ", 250)) + "..."
    : summary;

  return (
    <Card className={cn("border-border/50", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle className="font-display text-lg">Your Readiness Summary</CardTitle>
          </div>
          {onViewReport && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onViewReport}
              className="text-muted-foreground hover:text-foreground gap-1"
            >
              Full Report
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary text */}
        <p className="text-muted-foreground font-body leading-relaxed">
          {truncatedSummary}
        </p>
        
        {/* Metrics chips */}
        {metrics && (
          <div className="flex flex-wrap gap-3 pt-2">
            <div className="inline-flex items-center gap-1.5 text-sm">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span className="text-foreground font-medium">{metrics.strengthsIdentified}</span>
              <span className="text-muted-foreground">strengths identified</span>
            </div>
            <div className="inline-flex items-center gap-1.5 text-sm">
              <Circle className="h-4 w-4 text-amber-500" />
              <span className="text-foreground font-medium">{metrics.areasToAddress}</span>
              <span className="text-muted-foreground">areas to address</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ReportSummaryCard;
