import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle2, ArrowRight, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReportMetrics, Strength, AttentionArea } from "@/types/report";

interface ReportSummaryCardProps {
  summary: string;
  metrics?: ReportMetrics;
  strengths?: Strength[];
  areasToImprove?: AttentionArea[];
  onViewReport?: () => void;
  className?: string;
}

export function ReportSummaryCard({
  summary,
  metrics,
  strengths,
  areasToImprove,
  onViewReport,
  className,
}: ReportSummaryCardProps) {
  // Show more of the summary (400 chars)
  const truncatedSummary =
    summary.length > 400
      ? summary.slice(0, summary.lastIndexOf(" ", 400)) + "..."
      : summary;

  // Take top 3 of each
  const displayStrengths = strengths?.slice(0, 3) || [];
  const displayAreas = areasToImprove?.slice(0, 3) || [];

  return (
    <Card className={cn("border-border/50", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="font-display text-lg">
                Your Report Summary
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Key insights from your assessment
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Summary text */}
        <p className="text-muted-foreground font-body leading-relaxed text-sm">
          {truncatedSummary}
        </p>

        {/* Strengths and Areas columns */}
        {(displayStrengths.length > 0 || displayAreas.length > 0) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Strengths Column */}
            {displayStrengths.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Your Strengths
                </h4>
                <ul className="space-y-1.5">
                  {displayStrengths.map((strength, index) => (
                    <li
                      key={index}
                      className="text-sm text-muted-foreground flex items-start gap-2"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{strength.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Areas to Improve Column */}
            {displayAreas.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <ArrowRight className="h-4 w-4 text-amber-500" />
                  Areas to Improve
                </h4>
                <ul className="space-y-1.5">
                  {displayAreas.map((area, index) => (
                    <li
                      key={index}
                      className="text-sm text-muted-foreground flex items-start gap-2"
                    >
                      <ArrowRight className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{area.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* View Full Report link */}
        {onViewReport && (
          <div className="pt-2 border-t border-border/50">
            <Button
              variant="ghost"
              size="sm"
              onClick={onViewReport}
              className="text-primary hover:text-primary/80 gap-1 -ml-2"
            >
              View Full Report
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ReportSummaryCard;
