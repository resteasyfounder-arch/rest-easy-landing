import { Button } from "@/components/ui/button";
import { ArrowRight, Play, FileText, RotateCcw, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import type { AssessmentState } from "@/types/assessment";

interface AssessmentCTAProps {
  assessmentState: AssessmentState;
  className?: string;
}

export function AssessmentCTA({ assessmentState, className }: AssessmentCTAProps) {
  const { status, report_status, overall_progress, profile_complete } = assessmentState;

  // Not started - prompt to begin
  if (status === "not_started" || overall_progress === 0) {
    return (
      <Button asChild size="lg" className={className}>
        <Link to="/readiness" className="gap-2">
          <Play className="h-4 w-4" />
          Start Assessment
        </Link>
      </Button>
    );
  }

  // Profile incomplete - prompt to complete profile
  if (!profile_complete) {
    return (
      <Button asChild size="lg" className={className}>
        <Link to="/readiness" className="gap-2">
          <ArrowRight className="h-4 w-4" />
          Complete Your Profile
        </Link>
      </Button>
    );
  }

  // In progress - continue (but NOT if they're at 100% - that means complete)
  if ((status === "draft" || status === "in_progress") && overall_progress < 100) {
    return (
      <Button asChild size="lg" className={className}>
        <Link to="/readiness" className="gap-2">
          <ArrowRight className="h-4 w-4" />
          Continue Assessment
          <span className="text-primary-foreground/70 text-sm ml-1">
            ({Math.round(overall_progress)}%)
          </span>
        </Link>
      </Button>
    );
  }

  // Assessment complete (100% progress) but not yet marked as completed status
  // OR status is completed - show report options
  if (overall_progress >= 100 || status === "completed") {
    // Check if we have an existing report
    const hasExistingReport = localStorage.getItem("rest-easy.readiness.report") !== null;
    const isReportStale = localStorage.getItem("rest-easy.readiness.report_stale") === "true";

    if (hasExistingReport && !isReportStale) {
      // Have a valid report - show view report option
      return (
        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild size="lg" className={className}>
            <Link to="/results" className="gap-2">
              <FileText className="h-4 w-4" />
              View Full Report
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/readiness" className="gap-2">
              <Eye className="h-4 w-4" />
              Review Answers
            </Link>
          </Button>
        </div>
      );
    }

    // Assessment complete but no report yet (or stale) - prompt to generate
    return (
      <div className="flex flex-col sm:flex-row gap-3">
        <Button asChild size="lg" className={className}>
          <Link to="/readiness" className="gap-2">
            <FileText className="h-4 w-4" />
            {isReportStale ? "Regenerate Report" : "Generate Report"}
          </Link>
        </Button>
        {hasExistingReport && (
          <Button asChild variant="outline" size="lg">
            <Link to="/results" className="gap-2">
              <Eye className="h-4 w-4" />
              View Previous Report
            </Link>
          </Button>
        )}
      </div>
    );
  }

  // Fallback
  return (
    <Button asChild size="lg" className={className}>
      <Link to="/readiness" className="gap-2">
        <ArrowRight className="h-4 w-4" />
        Continue
      </Link>
    </Button>
  );
}

export default AssessmentCTA;
