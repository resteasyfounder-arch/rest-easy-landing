import { Check, AlertCircle, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  findabilityQuestions,
  type AnswerValue,
} from "@/data/findabilityQuestions";

interface ResultsBreakdownProps {
  answers: Record<string, AnswerValue>;
}

const answerLabels: Record<AnswerValue, string> = {
  yes: "Yes",
  somewhat: "Somewhat",
  no: "No",
};

const ResultsBreakdown = ({ answers }: ResultsBreakdownProps) => {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="font-display text-xl font-semibold text-foreground mb-2">
          Your Breakdown
        </h2>
        <p className="font-body text-sm text-muted-foreground">
          See how you scored in each area
        </p>
      </div>

      <Accordion type="multiple" className="space-y-2">
        {findabilityQuestions.map((question, index) => {
          const answer = answers[question.id];
          const guidance = answer ? question.guidance[answer] : "";

          return (
            <AccordionItem
              key={question.id}
              value={question.id}
              className={cn(
                "border rounded-xl px-4 overflow-hidden transition-colors",
                answer === "yes" && "bg-green-500/5 border-green-500/20",
                answer === "somewhat" && "bg-amber-500/5 border-amber-500/20",
                answer === "no" && "bg-red-400/5 border-red-400/20"
              )}
            >
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3 text-left">
                  {/* Status icon */}
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
                      answer === "yes" && "bg-green-500 text-white",
                      answer === "somewhat" && "bg-amber-500 text-white",
                      answer === "no" && "bg-red-400 text-white"
                    )}
                  >
                    {answer === "yes" && <Check className="w-4 h-4" />}
                    {answer === "somewhat" && <AlertCircle className="w-3 h-3" />}
                    {answer === "no" && <X className="w-4 h-4" />}
                  </div>

                  {/* Question info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-body font-medium text-foreground text-sm">
                      {question.categoryLabel}
                    </p>
                    <p className="font-body text-xs text-muted-foreground">
                      You answered: {answer ? answerLabels[answer] : "—"}
                    </p>
                  </div>
                </div>
              </AccordionTrigger>

              <AccordionContent className="pb-4">
                <div className="pl-9 space-y-3">
                  <p className="font-body text-sm text-foreground/80">
                    {question.question}
                  </p>
                  <div
                    className={cn(
                      "p-3 rounded-lg text-sm font-body",
                      answer === "yes" && "bg-green-500/10 text-green-800",
                      answer === "somewhat" && "bg-amber-500/10 text-amber-800",
                      answer === "no" && "bg-red-400/10 text-red-800"
                    )}
                  >
                    {guidance}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
};

export default ResultsBreakdown;
