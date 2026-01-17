import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/layout/AppLayout";
import type { ReadinessReport } from "@/types/report";
import { Download, ArrowLeft, Loader2 } from "lucide-react";
import {
  ReportHeader,
  ExecutiveSummary,
  ImmediateActions,
  CategoryScores,
  StrengthsSection,
  AttentionSection,
  ActionPlan,
  Timeline,
  ClosingMessage,
  ReportLoading,
} from "@/components/results";
import { ShareReportDialog } from "@/components/results/ShareReportDialog";

const REPORT_STORAGE_KEY = "rest-easy.readiness.report";

const Results = () => {
  const navigate = useNavigate();
  const [report, setReport] = useState<ReadinessReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem(REPORT_STORAGE_KEY);
    if (stored) {
      try {
        setReport(JSON.parse(stored));
      } catch (err) {
        console.error("Failed to parse stored report:", err);
      }
    }
    setLoading(false);
  }, []);

  const handleDownloadPDF = async () => {
    if (!reportRef.current || !report) return;
    
    setDownloading(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      
      const opt = {
        margin: [0.5, 0.5, 0.5, 0.5],
        filename: `Rest-Easy-Readiness-Report-${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          letterRendering: true,
        },
        jsPDF: { 
          unit: 'in', 
          format: 'letter', 
          orientation: 'portrait' 
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      await html2pdf().set(opt).from(reportRef.current).save();
    } catch (err) {
      console.error("Failed to generate PDF:", err);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout hideNav>
        <div className="min-h-screen bg-white">
          <ReportLoading />
        </div>
      </AppLayout>
    );
  }

  // No report - prompt to take assessment
  if (!report) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
          <div className="max-w-md text-center py-12">
            <h1 className="text-3xl font-display font-semibold text-foreground mb-4">
              Your Readiness Report
            </h1>
            <p className="text-muted-foreground font-body mb-8">
              Complete the Life Readiness assessment to receive your personalized report with actionable recommendations.
            </p>
            <Button onClick={() => navigate("/readiness")} className="press-effect">
              Start Life Readiness Assessment
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout hideNav>
      {/* Sticky Header with Actions */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 print:hidden">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard")}
            className="gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Button>
          
          <h1 className="font-display font-semibold text-gray-900 hidden sm:block">
            Life Readiness Report
          </h1>

          <div className="flex items-center gap-2">
            <ShareReportDialog report={report} />
            <Button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="gap-2 bg-primary hover:bg-primary/90"
            >
              {downloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">{downloading ? "Generating..." : "Download PDF"}</span>
            </Button>
          </div>
        </div>
      </header>

      {/* PDF-Ready Report Content */}
      <div 
        ref={reportRef}
        className="pt-20 pb-12 bg-white min-h-screen print:pt-0"
      >
        <div className="max-w-4xl mx-auto px-6 print:px-8">
          {/* Report Header */}
          <ReportHeader
            score={report.overallScore}
            tier={report.tier}
            userName={report.userName}
            generatedAt={report.generatedAt}
          />

          {/* Executive Summary */}
          <section className="mt-8 print:break-inside-avoid">
            <ExecutiveSummary summary={report.executive_summary} />
          </section>

          {/* Two Column Layout for Desktop */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6 print:grid-cols-1">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Immediate Actions */}
              <section className="print:break-inside-avoid">
                <ImmediateActions actions={report.immediate_actions} />
              </section>

              {/* Strengths */}
              <section className="print:break-inside-avoid">
                <StrengthsSection strengths={report.strengths} />
              </section>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Category Breakdown */}
              <section className="print:break-inside-avoid">
                <CategoryScores categories={report.category_analyses} />
              </section>

              {/* Areas Requiring Attention */}
              <section className="print:break-inside-avoid">
                <AttentionSection areas={report.areas_requiring_attention} />
              </section>
            </div>
          </div>

          {/* Full Width Sections */}
          <section className="mt-8 print:break-inside-avoid">
            <ActionPlan actions={report.action_plan} />
          </section>

          <section className="mt-8 print:break-inside-avoid">
            <Timeline timeline={report.timeline} />
          </section>

          <section className="mt-8 print:break-inside-avoid">
            <ClosingMessage message={report.closing_message} />
          </section>

          {/* Footer for PDF */}
          <footer className="mt-12 pt-6 border-t border-gray-200 text-center print:break-inside-avoid">
            <p className="text-sm text-gray-500 font-body">
              This report was generated by Rest Easy on {new Date(report.generatedAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              © {new Date().getFullYear()} Rest Easy. All rights reserved.
            </p>
          </footer>
        </div>
      </div>

      {/* Bottom Actions - Not in PDF */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 print:hidden">
        <div className="max-w-4xl mx-auto flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => navigate("/readiness")} 
            className="flex-1"
          >
            Retake Assessment
          </Button>
          <ShareReportDialog report={report} />
          <Button 
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="flex-1 gap-2"
          >
            {downloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Download Report
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default Results;
