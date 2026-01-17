import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/layout/AppLayout";
import Header from "@/components/Header";
import type { ReadinessReport } from "@/types/report";
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

const REPORT_STORAGE_KEY = "rest-easy.readiness.report";

const Results = () => {
  const navigate = useNavigate();
  const [report, setReport] = useState<ReadinessReport | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <AppLayout>
        <Header />
        <div className="pt-20">
          <ReportLoading />
        </div>
      </AppLayout>
    );
  }

  // No report - prompt to take assessment
  if (!report) {
    return (
      <AppLayout>
        <Header />
        <div className="pt-20 px-4 pb-8">
          <div className="max-w-lg mx-auto text-center py-12">
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
    <AppLayout>
      <Header />
      <div className="pt-20 pb-8">
        <div className="max-w-2xl mx-auto px-4 space-y-6">
          {/* Report Header */}
          <ReportHeader
            score={report.overallScore}
            tier={report.tier}
            userName={report.userName}
            generatedAt={report.generatedAt}
          />

          {/* Executive Summary */}
          <ExecutiveSummary summary={report.executive_summary} />

          {/* Immediate Actions */}
          <ImmediateActions actions={report.immediate_actions} />

          {/* Category Breakdown */}
          <CategoryScores categories={report.category_analyses} />

          {/* Strengths */}
          <StrengthsSection strengths={report.strengths} />

          {/* Areas Requiring Attention */}
          <AttentionSection areas={report.areas_requiring_attention} />

          {/* Action Plan */}
          <ActionPlan actions={report.action_plan} />

          {/* Timeline */}
          <Timeline timeline={report.timeline} />

          {/* Closing Message */}
          <ClosingMessage message={report.closing_message} />

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-4 pb-8">
            <Button onClick={() => navigate("/dashboard")} className="w-full min-h-[56px]">
              Go to Dashboard
            </Button>
            <Button variant="outline" onClick={() => navigate("/readiness")} className="w-full">
              Retake Assessment
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Results;
