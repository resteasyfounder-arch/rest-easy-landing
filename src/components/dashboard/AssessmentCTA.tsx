import { Button } from "@/components/ui/button";
import { ArrowRight, Play, FileText, RotateCcw } from "lucide-react";
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
  if (!profile_complete && overall_progress < 10) {
    return (
      <Button asChild size="lg" className={className}>
        <Link to="/readiness" className="gap-2">
          <ArrowRight className="h-4 w-4" />
          Complete Your Profile
        </Link>
      </Button>
    );
  }

  // In progress - continue
  if (status === "draft" || status === "in_progress") {
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

  // Completed - view report or retake
  if (status === "completed") {
    if (report_status === "ready") {
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
              <RotateCcw className="h-4 w-4" />
              Retake Assessment
            </Link>
          </Button>
        </div>
      );
    }

    if (report_status === "generating") {
      return (
        <Button size="lg" disabled className={className}>
          <span className="animate-pulse">Generating Report...</span>
        </Button>
      );
    }

    // Report failed or not started after completion
    return (
      <Button asChild size="lg" className={className}>
        <Link to="/results" className="gap-2">
          <FileText className="h-4 w-4" />
          View Results
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
