import { Check, ChevronRight, Edit2 } from "lucide-react";
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
  onEdit,
  onContinue,
}: ProfileReviewProps) => {
  return (
    <div className="flex flex-col min-h-[60vh] px-6 py-4 animate-fade-up">
      {/* Header - warm acknowledgment */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-primary" />
        </div>
        <h1 className="font-display text-2xl font-semibold text-foreground mb-2">
          Thank you
        </h1>
        <p className="font-body text-muted-foreground">
          Here's what you shared. Feel free to make any changes.
        </p>
      </div>

      {/* Answers Summary - clean and simple */}
      <div className="space-y-2 mb-8">
        {answers.map((item) => (
          <button
            key={item.questionId}
            onClick={() => onEdit(item.questionId)}
            className={cn(
              "w-full flex items-center justify-between p-4 rounded-xl border border-border/50",
              "bg-card/60 hover:bg-muted/30 transition-colors text-left group"
            )}
          >
            <div className="flex-1 min-w-0">
              <p className="font-body text-sm text-foreground">
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

      {/* Spacer */}
      <div className="flex-1" />

      {/* CTA - simple, calm */}
      <div className="space-y-3">
        <Button
          size="lg"
          onClick={onContinue}
          className="w-full font-body press-effect gap-2"
        >
          Continue
          <ChevronRight className="w-4 h-4" />
        </Button>
        <p className="text-center text-xs text-muted-foreground font-body">
          You can update these anytime from your profile
        </p>
      </div>
    </div>
  );
};

export default ProfileReview;
