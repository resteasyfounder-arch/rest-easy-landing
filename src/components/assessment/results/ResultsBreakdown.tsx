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
    <div className="space-y-3">
      <h2 className="font-display text-base font-semibold text-foreground text-center">
        Your Breakdown
      </h2>

      <Accordion type="single" collapsible className="space-y-1.5">
        {findabilityQuestions.map((question) => {
          const answer = answers[question.id];
          const guidance = answer ? question.guidance[answer] : "";

          return (
            <AccordionItem
              key={question.id}
              value={question.id}
              className={cn(
                "border rounded-lg px-3 overflow-hidden transition-colors",
                answer === "yes" && "bg-green-500/5 border-green-500/20",
                answer === "somewhat" && "bg-amber-500/5 border-amber-500/20",
                answer === "no" && "bg-red-400/5 border-red-400/20"
              )}
            >
              <AccordionTrigger className="hover:no-underline py-2.5">
                <div className="flex items-center gap-2 text-left">
                  {/* Status icon */}
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0",
                      answer === "yes" && "bg-green-500 text-white",
                      answer === "somewhat" && "bg-amber-500 text-white",
                      answer === "no" && "bg-red-400 text-white"
                    )}
                  >
                    {answer === "yes" && <Check className="w-3 h-3" />}
                    {answer === "somewhat" && <AlertCircle className="w-2.5 h-2.5" />}
                    {answer === "no" && <X className="w-3 h-3" />}
                  </div>

                  {/* Question info - single line */}
                  <p className="font-body font-medium text-foreground text-sm flex-1">
                    {question.categoryLabel}
                  </p>
                </div>
              </AccordionTrigger>

              <AccordionContent className="pb-3">
                <div className="pl-7">
                  <div
                    className={cn(
                      "p-2.5 rounded-lg text-sm font-body",
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
