import { Check, ChevronRight, Edit2, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProfileAnswer {
  question: string;
  answer: string;
  questionId: string;
}

interface ProfileReviewProps {
  answers: ProfileAnswer[];
  applicableQuestionCount: number;
  totalQuestionCount: number;
  onEdit: (questionId: string) => void;
  onContinue: () => void;
}

const ProfileReview = ({
  answers,
  applicableQuestionCount,
  totalQuestionCount,
  onEdit,
  onContinue,
}: ProfileReviewProps) => {
  const skippedCount = totalQuestionCount - applicableQuestionCount;

  return (
    <div className="flex flex-col min-h-[60vh] px-6 py-4 animate-fade-up">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-primary" />
        </div>
        <h1 className="font-display text-2xl font-semibold text-foreground mb-2">
          Profile Complete
        </h1>
        <p className="font-body text-sm text-muted-foreground">
          Review your answers before continuing
        </p>
      </div>

      {/* Answers Summary */}
      <div className="space-y-2 mb-6">
        {answers.map((item, index) => (
          <button
            key={item.questionId}
            onClick={() => onEdit(item.questionId)}
            className={cn(
              "w-full flex items-center justify-between p-4 rounded-xl border border-border/60",
              "bg-card hover:bg-muted/30 transition-colors text-left group"
            )}
          >
            <div className="flex-1 min-w-0">
              <p className="font-body text-xs text-muted-foreground mb-1">
                Question {index + 1}
              </p>
              <p className="font-body text-sm text-foreground truncate">
                {item.question}
              </p>
              <p className="font-body text-sm font-medium text-primary mt-1">
                {item.answer}
              </p>
            </div>
            <Edit2 className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors ml-3 flex-shrink-0" />
          </button>
        ))}
      </div>

      {/* Assessment Preview */}
      <div className="flex-1">
        <div className="p-4 rounded-xl bg-secondary/50 border border-border/50">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <ClipboardList className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-body text-sm font-medium text-foreground">
                Your Assessment
              </p>
              <p className="font-body text-xs text-muted-foreground mt-1">
                {applicableQuestionCount} questions tailored to you
                {skippedCount > 0 && (
                  <span className="text-primary">
                    {" "}• {skippedCount} skipped (not applicable)
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <div className="mt-6">
        <Button
          size="lg"
          onClick={onContinue}
          className="w-full font-body press-effect gap-2"
        >
          Continue to Assessment
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default ProfileReview;
