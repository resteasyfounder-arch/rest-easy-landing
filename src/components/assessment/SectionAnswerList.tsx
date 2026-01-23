import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check, Edit2, Save, X } from "lucide-react";
import { cn } from "@/lib/utils";
import AnswerButton from "./shared/AnswerButton";

type AnswerValue = "yes" | "partial" | "no" | "not_sure" | "na";

type SchemaOption = {
  value: AnswerValue;
  label: string;
  score_value?: AnswerValue;
};

type AnswerRecord = {
  question_id: string;
  item_id: string;
  section_id: string;
  dimension: string;
  answer_value: AnswerValue;
  answer_label?: string;
  score_fraction?: number | null;
  question_text?: string;
};

interface SectionAnswerListProps {
  sectionId: string;
  sectionLabel: string;
  questions: Array<{
    id: string;
    item_id: string;
    section_id: string;
    dimension: string;
    prompt: string;
    options: SchemaOption[];
    weight: number;
  }>;
  answers: Record<string, AnswerRecord>;
  answerScoring: Record<AnswerValue, number | null>;
  onSaveChanges: (updatedAnswers: AnswerRecord[]) => Promise<void>;
  onBack: () => void;
}

export function SectionAnswerList({
  sectionId,
  sectionLabel,
  questions,
  answers,
  answerScoring,
  onSaveChanges,
  onBack,
}: SectionAnswerListProps) {
  const [pendingEdits, setPendingEdits] = useState<Record<string, AnswerRecord>>({});
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const sectionQuestions = useMemo(
    () => questions.filter((q) => q.section_id === sectionId),
    [questions, sectionId]
  );

  const hasChanges = Object.keys(pendingEdits).length > 0;

  const handleEditClick = (questionId: string) => {
    setExpandedQuestion(expandedQuestion === questionId ? null : questionId);
  };

  const handleAnswerChange = (question: typeof sectionQuestions[0], newValue: AnswerValue) => {
    const option = question.options.find((o) => o.value === newValue);
    const scoreValue = (option?.score_value ?? option?.value ?? "na") as AnswerValue;
    const scoreFraction = scoreValue === "na" ? null : answerScoring[scoreValue] ?? null;

    const updatedAnswer: AnswerRecord = {
      question_id: question.id,
      item_id: question.item_id,
      section_id: question.section_id,
      dimension: question.dimension,
      answer_value: newValue,
      answer_label: option?.label,
      score_fraction: scoreFraction,
      question_text: question.prompt,
    };

    setPendingEdits((prev) => ({
      ...prev,
      [question.id]: updatedAnswer,
    }));
    setExpandedQuestion(null);
  };

  const handleCancelEdit = (questionId: string) => {
    setPendingEdits((prev) => {
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
  };

  const handleSaveAll = async () => {
    if (!hasChanges) return;

    setSaving(true);
    try {
      await onSaveChanges(Object.values(pendingEdits));
      setPendingEdits({});
    } finally {
      setSaving(false);
    }
  };

  const getDisplayAnswer = (questionId: string): AnswerRecord | undefined => {
    return pendingEdits[questionId] || answers[questionId];
  };

  const getAnswerBadgeColor = (value: AnswerValue) => {
    switch (value) {
      case "yes":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "partial":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case "no":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h2 className="font-display text-xl font-semibold text-foreground">
            {sectionLabel}
          </h2>
          <p className="text-sm text-muted-foreground">
            Review and edit your answers
          </p>
        </div>
      </div>

      {/* Changes indicator */}
      {hasChanges && (
        <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20">
          <span className="text-sm text-primary font-medium">
            {Object.keys(pendingEdits).length} unsaved change(s)
          </span>
          <Button size="sm" onClick={handleSaveAll} disabled={saving} className="gap-2">
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Apply Changes"}
          </Button>
        </div>
      )}

      {/* Question List */}
      <div className="space-y-3">
        {sectionQuestions.map((question, index) => {
          const displayAnswer = getDisplayAnswer(question.id);
          const isEdited = !!pendingEdits[question.id];
          const isExpanded = expandedQuestion === question.id;

          return (
            <Card
              key={question.id}
              className={cn(
                "transition-all duration-200",
                isEdited && "border-primary/50 bg-primary/5",
                isExpanded && "ring-2 ring-primary/20"
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <span className="text-sm font-medium text-muted-foreground min-w-[24px]">
                    {index + 1}.
                  </span>
                  <div className="flex-1 space-y-3">
                    <p className="text-sm text-foreground leading-relaxed">
                      {question.prompt}
                    </p>

                    {!isExpanded ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs",
                              displayAnswer && getAnswerBadgeColor(displayAnswer.answer_value)
                            )}
                          >
                            {displayAnswer?.answer_label || "Not answered"}
                          </Badge>
                          {isEdited && (
                            <Badge variant="secondary" className="text-xs">
                              Edited
                            </Badge>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditClick(question.id)}
                          className="gap-1.5"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          Edit
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3 pt-2 border-t border-border/50">
                        <div className="space-y-2">
                          {question.options.map((option) => (
                            <button
                              key={option.value}
                              onClick={() => handleAnswerChange(question, option.value)}
                              className={cn(
                                "w-full text-left px-4 py-3 rounded-lg border transition-all",
                                displayAnswer?.answer_value === option.value
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "border-border bg-card hover:border-primary/50"
                              )}
                            >
                              <span className="text-sm font-medium">{option.label}</span>
                            </button>
                          ))}
                        </div>
                        <div className="flex items-center justify-end gap-2">
                          {isEdited && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCancelEdit(question.id)}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Cancel
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setExpandedQuestion(null)}
                          >
                            Done
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Bottom Actions */}
      <div className="pt-4 border-t border-border space-y-3">
        {hasChanges ? (
          <Button onClick={handleSaveAll} disabled={saving} className="w-full gap-2">
            <Save className="w-4 h-4" />
            {saving ? "Saving Changes..." : `Apply ${Object.keys(pendingEdits).length} Change(s)`}
          </Button>
        ) : (
          <Button onClick={onBack} variant="outline" className="w-full">
            Back to Summary
          </Button>
        )}
      </div>
    </div>
  );
}

export default SectionAnswerList;
