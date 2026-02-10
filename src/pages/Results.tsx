import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/layout/AppLayout";
import type { ReadinessReport } from "@/types/report";
import { useRemySurface } from "@/hooks/useRemySurface";
import { useAssessmentState } from "@/hooks/useAssessmentState";
import { RemyPriorityList } from "@/components/remy/RemyPriorityList";
import { Download, ArrowLeft, Loader2, Play, ArrowRight, RefreshCw, AlertTriangle } from "lucide-react";
import {
  CoverPage,
  TableOfContents,
  ExecutiveSummary,
  ImmediateActions,
  CategoryScores,
  StrengthsSection,
  AttentionSection,
  ActionPlan,
  JourneyReflection,
  Timeline,
  MovingForward,
  ResourcesSection,
  ClosingMessage,
  ReportLoading,
} from "@/components/results";
import { ShareReportDialog } from "@/components/results/ShareReportDialog";
import restEasyLogo from "@/assets/rest-easy-logo.png";
import { invokeAuthedFunction } from "@/lib/invokeAuthedFunction";

async function callAgent(payload: Record<string, unknown>) {
  return invokeAuthedFunction<Record<string, unknown>>("agent", payload);
}

const Results = () => {
  const navigate = useNavigate();
  const { assessmentState } = useAssessmentState();
  const [report, setReport] = useState<ReadinessReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportFailed, setReportFailed] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  const {
    payload: remyPayload,
    isLoading: isLoadingRemy,
    error: remyError,
    dismissNudge,
    acknowledgeAction,
  } = useRemySurface({
    subjectId: assessmentState.subject_id || null,
    surface: "results",
    enabled: !loading && !isGenerating,
  });

  const startPollingForReport = () => {
    const maxAttempts = 60; // 60 attempts * 2 seconds = 2 minutes max
    let attempts = 0;

    const poll = async () => {
      attempts++;
      try {
        const [reportData, stateData] = await Promise.all([
          callAgent({
            action: "get_report",
            assessment_id: "readiness_v1",
          }),
          callAgent({
            action: "get_state",
            assessment_id: "readiness_v1",
          }),
        ]);

        const reportStale = (stateData?.assessment_state as Record<string, unknown>)?.report_stale;
        const reportStatus = (stateData?.assessment_state as Record<string, unknown>)?.report_status;

        if (reportData.report && !reportStale && reportStatus === "ready") {
          console.log("[Results] Report ready after polling (not stale)");
          setReport(reportData.report as ReadinessReport);
          setReportFailed(false);
          setIsGenerating(false);
          return;
        }

        if (reportStatus === "failed") {
          setIsGenerating(false);
          setReportFailed(true);
          return;
        }

        if (attempts < maxAttempts) {
          setTimeout(poll, 2000);
        } else {
          console.log("[Results] Polling timed out");
          setIsGenerating(false);
        }
      } catch (err) {
        console.error("[Results] Polling error:", err);
        if (attempts < maxAttempts) {
          setTimeout(poll, 2000);
        } else {
          setIsGenerating(false);
        }
      }
    };

    poll();
  };

  useEffect(() => {
    const fetchReport = async () => {
      try {
        // First check if report is being generated
        console.log("[Results] Checking report status...");
        const stateData = await callAgent({
          action: "get_state",
          assessment_id: "readiness_v1",
        });
        const reportStatus = (stateData?.assessment_state as Record<string, unknown>)?.report_status;
        const reportStale = (stateData?.assessment_state as Record<string, unknown>)?.report_stale;
        
        // If failed, show retry UI
        if (reportStatus === "failed") {
          console.log("[Results] Report generation failed, showing retry UI");
          setReportFailed(true);
          setLoading(false);
          return;
        }

        // If generating OR stale, show loading and poll
        if (reportStatus === "generating" || (reportStatus === "ready" && reportStale)) {
          console.log("[Results] Report is generating or stale, showing progress UI");
          setReportFailed(false);
          setIsGenerating(true);
          setLoading(false);
          startPollingForReport();
          return;
        }

        // Report exists or not generating - fetch it directly
        console.log("[Results] Fetching report from server...");
        const data = await callAgent({
          action: "get_report",
          assessment_id: "readiness_v1",
        });
        
        if (data.report) {
          console.log("[Results] Report loaded from server");
          setReportFailed(false);
          setReport(data.report as ReadinessReport);
        } else {
          console.log("[Results] No report found on server");
          const assessmentStatus = (stateData?.assessment_state as Record<string, unknown>)?.status;
          if (assessmentStatus === "completed") {
            console.log("[Results] Completed assessment has no report, requesting generation");
            const ensureData = await callAgent({
              action: "ensure_report",
              assessment_id: "readiness_v1",
            });
            const ensuredStatus = ensureData?.report_status as string | undefined;

            if (ensuredStatus === "failed") {
              setReportFailed(true);
              return;
            }

            if (ensuredStatus === "generating") {
              setReportFailed(false);
              setIsGenerating(true);
              startPollingForReport();
              return;
            }

            if (ensuredStatus === "ready") {
              const refreshed = await callAgent({
                action: "get_report",
                assessment_id: "readiness_v1",
              });
              if (refreshed.report) {
                setReportFailed(false);
                setReport(refreshed.report as ReadinessReport);
              }
            }
          }
        }
      } catch (err) {
        console.error("[Results] Failed to fetch report:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, []);

  const handleDownloadPDF = async () => {
    if (!reportRef.current || !report) return;
    
    setDownloading(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      
      const opt = {
        margin: [0.75, 0.75, 0.75, 0.75] as [number, number, number, number],
        filename: `Rest-Easy-Readiness-Report-${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'in' as const, format: 'letter', orientation: 'portrait' as const },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      await html2pdf().set(opt).from(reportRef.current).save();
    } catch (err) {
      console.error("Failed to generate PDF:", err);
    } finally {
      setDownloading(false);
    }
  };

  // Show generating UI when report is being generated
  if (isGenerating) {
    return (
      <AppLayout hideNav>
        <div className="min-h-screen bg-white"><ReportLoading /></div>
      </AppLayout>
    );
  }

  // Show failed UI with retry option
  if (reportFailed && !report) {
    const handleRetry = async () => {
      setRetrying(true);
      try {
        await callAgent({
          action: "retry_report",
          assessment_id: "readiness_v1",
        });
        setRetrying(false);
        setReportFailed(false);
        setIsGenerating(true);
        startPollingForReport();
      } catch (err) {
        console.error("[Results] Retry failed:", err);
        setRetrying(false);
      }
    };

    return (
      <AppLayout>
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
          <div className="max-w-md text-center py-12">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <h1 className="text-3xl font-display font-semibold text-foreground mb-4">Report Generation Failed</h1>
            <p className="text-muted-foreground font-body mb-8">
              Something went wrong while generating your report. This can happen due to temporary service issues. Please try again.
            </p>
            <Button onClick={handleRetry} disabled={retrying} className="press-effect gap-2">
              {retrying ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              {retrying ? "Retrying..." : "Retry Report Generation"}
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Show minimal loading for quick fetches (just a brief spinner, won't flash)
  if (loading) {
    return (
      <AppLayout hideNav>
        <div className="min-h-screen flex items-center justify-center bg-white">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (!report) {
    const hasProgress = assessmentState.status !== "not_started" && assessmentState.overall_progress > 0;
    const ctaLabel = hasProgress
      ? `Continue Assessment (${Math.round(assessmentState.overall_progress)}%)`
      : "Start Assessment";
    const ctaDescription = hasProgress
      ? "Continue your Life Readiness assessment to receive your personalized report."
      : "Complete the Life Readiness assessment to receive your personalized report.";
    const CtaIcon = hasProgress ? ArrowRight : Play;

    return (
      <AppLayout>
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
          <div className="max-w-md text-center py-12">
            <h1 className="text-3xl font-display font-semibold text-foreground mb-4">Your Readiness Report</h1>
            <p className="text-muted-foreground font-body mb-8">{ctaDescription}</p>
            <Button onClick={() => navigate("/readiness")} className="press-effect gap-2">
              <CtaIcon className="h-4 w-4" />
              {ctaLabel}
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const metrics = report.metrics || {
    categoriesAssessed: report.category_analyses?.length || 9,
    strengthsIdentified: report.strengths?.length || 6,
    areasToAddress: report.areas_requiring_attention?.length || 6,
    actionItems: report.action_plan?.length || 8,
  };

  return (
    <AppLayout hideNav>
      {/* Sticky Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 print:hidden">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </Button>
          <h1 className="font-display font-semibold text-gray-900 text-sm">Life Readiness Report</h1>
          <div className="flex items-center gap-2">
            <ShareReportDialog report={report} assessmentId={assessmentState.assessment_id || null} />
            <Button onClick={handleDownloadPDF} disabled={downloading} size="sm" className="gap-2">
              {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              <span className="hidden sm:inline">{downloading ? "Generating..." : "Download"}</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Document-Style Report */}
      <div ref={reportRef} className="pt-16 pb-24 bg-white min-h-screen print:pt-0 print:pb-0">
        <div className="max-w-3xl mx-auto px-8 print:px-12 print:max-w-none">
          
          {/* Cover Page */}
          <CoverPage 
            score={report.overallScore} 
            tier={report.tier} 
            userName={report.userName} 
            generatedAt={report.generatedAt} 
            metrics={metrics} 
          />

          {/* Table of Contents */}
          <TableOfContents />

          {/* Executive Summary */}
          <ExecutiveSummary summary={report.executive_summary} />

          {/* Immediate Actions */}
          <ImmediateActions actions={report.immediate_actions} />

          {/* Remy Priorities */}
          <RemyPriorityList
            payload={remyPayload}
            isLoading={isLoadingRemy}
            error={remyError}
            onDismiss={(nudgeId) => dismissNudge(nudgeId, 24)}
            onAcknowledge={acknowledgeAction}
            className="mt-8"
          />

          {/* Category Scores with Detailed Analysis */}
          <CategoryScores categories={report.category_analyses} />

          {/* Strengths */}
          <StrengthsSection strengths={report.strengths} />

          {/* Attention Areas */}
          <AttentionSection areas={report.areas_requiring_attention} />

          {/* Action Plan */}
          <ActionPlan actions={report.action_plan} />

          {/* Journey Reflection */}
          {report.journey_reflection && (
            <JourneyReflection reflection={report.journey_reflection} userName={report.userName} />
          )}

          {/* Timeline */}
          <Timeline timeline={report.timeline} />

          {/* Moving Forward */}
          {report.moving_forward && (
            <MovingForward content={report.moving_forward} userName={report.userName} />
          )}

          {/* Resources */}
          <ResourcesSection />

          {/* Closing Message */}
          <ClosingMessage message={report.closing_message} />

          {/* Footer */}
          <footer className="border-t-2 border-gray-200 pt-8 mt-12 text-center print:break-inside-avoid">
            <img src={restEasyLogo} alt="Rest Easy" className="h-10 mx-auto mb-4 opacity-60" />
            <p className="text-xs text-gray-400 font-body mb-2">
              End-of-Life Planning Services
            </p>
            <p className="text-xs text-gray-400 font-body mb-4 max-w-lg mx-auto">
              This report was generated based on your assessment responses and is intended to provide guidance for your planning journey. 
              The information contained herein is educational in nature and should not be considered legal, financial, or medical advice.
            </p>
            <p className="text-xs text-gray-500 font-body">
              Generated: {new Date(report.generatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              © {new Date().getFullYear()} Rest Easy. All rights reserved.
            </p>
          </footer>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 print:hidden">
        <div className="max-w-3xl mx-auto flex gap-3">
          <ShareReportDialog report={report} assessmentId={assessmentState?.assessment_id ?? null} />
          <Button onClick={handleDownloadPDF} disabled={downloading} className="flex-1 gap-2">
            {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Download PDF
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default Results;
