import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, ChevronRight, Edit3, Sparkles } from "lucide-react";

type AnswerRecord = {
  question_id: string;
  item_id: string;
  section_id: string;
  dimension: string;
  answer_value: string;
  answer_label?: string;
  score_fraction?: number | null;
  question_text?: string;
};

interface SectionSummaryProps {
  sectionId: string;
  sectionLabel: string;
  answers: Record<string, AnswerRecord>;
  questions: Array<{
    id: string;
    prompt: string;
    section_id: string;
  }>;
  onEditAnswers: () => void;
  onContinue: () => void;
  onBackToDashboard: () => void;
  onViewReport?: () => void;
  showContinueButton?: boolean;
  isAssessmentComplete?: boolean;
}

const SUPABASE_URL = "https://ltldbteqkpxqohbwqvrn.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0bGRidGVxa3B4cW9oYndxdnJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5OTY0MjUsImV4cCI6MjA4MzU3MjQyNX0.zSWhg_zFbrDhIA9egmaRsGsRiQg7Pd9fgHyTp39v3CE";

export function SectionSummary({
  sectionId,
  sectionLabel,
  answers,
  questions,
  onEditAnswers,
  onContinue,
  onBackToDashboard,
  onViewReport,
  showContinueButton = true,
  isAssessmentComplete = false,
}: SectionSummaryProps) {
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(false);

  // Calculate template-based stats
  const sectionQuestions = questions.filter((q) => q.section_id === sectionId);
  const sectionAnswers = sectionQuestions
    .map((q) => answers[q.id])
    .filter(Boolean);

  // Calculate score
  const scoredAnswers = sectionAnswers.filter(
    (a) => a.score_fraction !== null && a.score_fraction !== undefined
  );
  const totalScore = scoredAnswers.reduce((sum, a) => sum + (a.score_fraction || 0), 0);
  const avgScore = scoredAnswers.length > 0 ? Math.round((totalScore / scoredAnswers.length) * 100) : 0;

  // Create a cache key based on answers
  const answerHash = sectionAnswers
    .map((a) => `${a.question_id}:${a.answer_value}`)
    .sort()
    .join("|");
  const cacheKey = `section-insight:${sectionId}:${answerHash}`;

  // Fetch AI insight (async, with caching)
  useEffect(() => {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      setAiInsight(cached);
      return;
    }

    const fetchInsight = async () => {
      setAiLoading(true);
      setAiError(false);
      try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-section-summary`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            apikey: SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            sectionId,
            sectionLabel,
            answers: sectionAnswers.map((a) => ({
              question_text: a.question_text,
              answer_value: a.answer_value,
              answer_label: a.answer_label,
            })),
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.insight) {
            setAiInsight(data.insight);
            localStorage.setItem(cacheKey, data.insight);
          }
        } else {
          setAiError(true);
        }
      } catch (err) {
        console.error("Failed to fetch section insight:", err);
        setAiError(true);
      } finally {
        setAiLoading(false);
      }
    };

    fetchInsight();
  }, [cacheKey, sectionId, sectionLabel, sectionAnswers]);

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
        </div>
        <h2 className="font-display text-2xl font-semibold text-foreground">
          {sectionLabel}
        </h2>
        <p className="text-muted-foreground font-body">
          Section complete — here's your summary
        </p>
      </div>

      {/* Score Card */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-muted-foreground">Section Score</span>
            <span className="text-2xl font-display font-bold text-primary">{avgScore}%</span>
          </div>
          <Progress value={avgScore} className="h-2" />
        </CardContent>
      </Card>

      {/* AI Insight */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="p-4">
          <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            AI Insight
          </h3>
          {aiLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : aiError ? (
            <p className="text-sm text-muted-foreground italic">
              Unable to generate insight at this time.
            </p>
          ) : aiInsight ? (
            <p className="text-sm text-muted-foreground leading-relaxed">{aiInsight}</p>
          ) : (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="space-y-3 pt-4">
        <Button onClick={onEditAnswers} variant="outline" className="w-full gap-2">
          <Edit3 className="w-4 h-4" />
          Review & Edit Answers
        </Button>
        
        {/* Only show Continue if assessment is incomplete */}
        {showContinueButton && !isAssessmentComplete && (
          <Button onClick={onContinue} className="w-full gap-2">
            Continue Assessment
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
        
        {/* Show View Report for completed assessments */}
        {isAssessmentComplete && onViewReport && (
          <Button onClick={onViewReport} className="w-full gap-2">
            View Full Report
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
        
        <Button onClick={onBackToDashboard} variant="ghost" className="w-full">
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}

export default SectionSummary;
