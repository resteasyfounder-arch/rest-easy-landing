import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Play, FileText, Eye, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import type { AssessmentState } from "@/types/assessment";

interface AssessmentCTAProps {
  assessmentState: AssessmentState;
  className?: string;
}

export function AssessmentCTA({ assessmentState, className }: AssessmentCTAProps) {
  const { status, report_status, report_stale, overall_progress, profile_complete } = assessmentState;

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

  // Assessment complete (100% progress) - check report status
  if (overall_progress >= 100 || status === "completed") {
    const hasReport = report_status === "ready";
    const isGenerating = report_status === "generating";

    // Report is generating - show loading state
    if (isGenerating) {
      return (
        <Button disabled size="lg" className={className}>
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Preparing Report...
        </Button>
      );
    }

    if (hasReport) {
      // Have a report - show view report option with stale indicator if needed
      return (
        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild size="lg" className={className}>
            <Link to="/results" className="gap-2">
              <FileText className="h-4 w-4" />
              View Full Report
              {report_stale && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  Update Available
                </Badge>
              )}
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

    // Assessment complete but no report yet - auto-generation pending
    // Redirect to readiness which will auto-trigger generation
    return (
      <Button asChild size="lg" className={className}>
        <Link to="/readiness" className="gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Preparing Report...
        </Link>
      </Button>
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
