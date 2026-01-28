import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/layout/AppLayout";
import type { ReadinessReport } from "@/types/report";
import { Download, ArrowLeft, Loader2 } from "lucide-react";
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

const SUPABASE_URL = "https://ltldbteqkpxqohbwqvrn.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0bGRidGVxa3B4cW9oYndxdnJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5OTY0MjUsImV4cCI6MjA4MzU3MjQyNX0.zSWhg_zFbrDhIA9egmaRsGsRiQg7Pd9fgHyTp39v3CE";
const SUBJECT_ID_KEY = "rest-easy.readiness.subject_id";

const Results = () => {
  const navigate = useNavigate();
  const [report, setReport] = useState<ReadinessReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchReport = async () => {
      const subjectId = localStorage.getItem(SUBJECT_ID_KEY);

      if (!subjectId) {
        console.log("[Results] No subject_id found, cannot fetch report");
        setLoading(false);
        return;
      }

      try {
        // First check if report is being generated
        console.log("[Results] Checking report status...");
        const stateResponse = await fetch(`${SUPABASE_URL}/functions/v1/agent`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            apikey: SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            action: "get_state",
            subject_id: subjectId,
            assessment_id: "readiness_v1",
          }),
        });

        const stateData = await stateResponse.json();
        const reportStatus = stateData?.assessment_state?.report_status;
        const reportStale = stateData?.assessment_state?.report_stale;

        // If generating OR stale, show loading and poll
        if (reportStatus === "generating" || (reportStatus === "ready" && reportStale)) {
          console.log("[Results] Report is generating or stale, showing progress UI");
          setIsGenerating(true);
          setLoading(false);
          // Poll for report completion
          pollForReport(subjectId);
          return;
        }

        // Report exists or not generating - fetch it directly
        console.log("[Results] Fetching report from server...");
        const response = await fetch(`${SUPABASE_URL}/functions/v1/agent`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            apikey: SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            action: "get_report",
            subject_id: subjectId,
            assessment_id: "readiness_v1",
          }),
        });

        const data = await response.json();

        if (response.ok && data.report) {
          console.log("[Results] Report loaded from server");
          setReport(data.report as ReadinessReport);
        } else {
          console.log("[Results] No report found on server");
        }
      } catch (err) {
        console.error("[Results] Failed to fetch report:", err);
      } finally {
        setLoading(false);
      }
    };

    const pollForReport = async (subjectId: string) => {
      const maxAttempts = 60; // 60 attempts * 2 seconds = 2 minutes max
      let attempts = 0;

      const poll = async () => {
        attempts++;
        try {
          // Fetch BOTH report and state to check stale flag
          const [reportResponse, stateResponse] = await Promise.all([
            fetch(`${SUPABASE_URL}/functions/v1/agent`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
                apikey: SUPABASE_ANON_KEY,
              },
              body: JSON.stringify({
                action: "get_report",
                subject_id: subjectId,
                assessment_id: "readiness_v1",
              }),
            }),
            fetch(`${SUPABASE_URL}/functions/v1/agent`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
                apikey: SUPABASE_ANON_KEY,
              },
              body: JSON.stringify({
                action: "get_state",
                subject_id: subjectId,
                assessment_id: "readiness_v1",
              }),
            }),
          ]);

          const reportData = await reportResponse.json();
          const stateData = await stateResponse.json();

          const reportStale = stateData?.assessment_state?.report_stale;
          const reportStatus = stateData?.assessment_state?.report_status;

          // Only show report if it exists AND is not stale AND status is ready
          if (reportResponse.ok && reportData.report && !reportStale && reportStatus === "ready") {
            console.log("[Results] Report ready after polling (not stale)");
            setReport(reportData.report as ReadinessReport);
            setIsGenerating(false);
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

    fetchReport();
  }, []);

  const handleDownloadPDF = async () => {
    if (!reportRef.current || !report) return;

    setDownloading(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;

      const opt = {
        margin: [0.75, 0.75, 0.75, 0.75],
        filename: `Rest-Easy-Readiness-Report-${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
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
    return (
      <AppLayout>
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
          <div className="max-w-md text-center py-12">
            <h1 className="text-3xl font-display font-semibold text-foreground mb-4">Your Readiness Report</h1>
            <p className="text-muted-foreground font-body mb-8">Complete the Life Readiness assessment to receive your personalized report.</p>
            <Button onClick={() => navigate("/readiness")} className="press-effect">Start Assessment</Button>
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
            <ShareReportDialog report={report} />
            <Button onClick={handleDownloadPDF} disabled={downloading} size="sm" className="gap-2">
              {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              <span className="hidden sm:inline">{downloading ? "Generating..." : "Download"}</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Document-Style Report */}
      <div ref={reportRef} className="pt-16 pb-24 bg-background min-h-screen print:pt-0 print:pb-0">
        <div className="max-w-3xl mx-auto px-8 print:px-12 print:max-w-none space-y-12 md:space-y-16">

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

          <div className="space-y-12">
            {/* Executive Summary */}
            <ExecutiveSummary summary={report.executive_summary} />

            {/* Immediate Actions */}
            <ImmediateActions actions={report.immediate_actions} />
          </div>

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
          <footer className="border-t border-border/40 pt-12 mt-24 text-center print:break-inside-avoid">
            <img src={restEasyLogo} alt="Rest Easy" className="h-8 mx-auto mb-6 opacity-40 grayscale" />
            <p className="text-sm text-muted-foreground font-body mb-2">
              End-of-Life Planning Services
            </p>
            <p className="text-xs text-muted-foreground/60 font-body mb-4 max-w-lg mx-auto leading-relaxed">
              This report was generated based on your assessment responses and is intended to provide guidance for your planning journey.
              The information contained herein is educational in nature and should not be considered legal, financial, or medical advice.
            </p>
            <p className="text-xs text-muted-foreground/60 font-body">
              Generated: {new Date(report.generatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <p className="text-xs text-muted-foreground/40 mt-2">
              © {new Date().getFullYear()} Rest Easy. All rights reserved.
            </p>
          </footer>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t border-border/40 p-4 print:hidden z-40">
        <div className="max-w-3xl mx-auto flex gap-3">
          <ShareReportDialog report={report} />
          <Button onClick={handleDownloadPDF} disabled={downloading} className="flex-1 gap-2 shadow-soft">
            {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Download PDF
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default Results;
