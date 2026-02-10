import { Check, Circle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  findabilityQuestions,
  type AnswerValue,
} from "@/data/findabilityQuestions";

interface ResultsBreakdownProps {
  answers: Record<string, AnswerValue>;
}

interface GroupConfig {
  key: AnswerValue;
  title: string;
  icon: typeof Check;
  bgClass: string;
  iconBgClass: string;
  iconColorClass: string;
}

const groups: GroupConfig[] = [
  {
    key: "yes",
    title: "Solid",
    icon: Check,
    bgClass: "bg-primary/[0.04] border-primary/10",
    iconBgClass: "bg-primary/15",
    iconColorClass: "text-primary",
  },
  {
    key: "somewhat",
    title: "Needs Attention",
    icon: Circle,
    bgClass: "bg-amber-500/[0.04] border-amber-500/10",
    iconBgClass: "bg-amber-500/15",
    iconColorClass: "text-amber-600",
  },
  {
    key: "no",
    title: "Not Yet Covered",
    icon: ArrowRight,
    bgClass: "bg-muted/40 border-border",
    iconBgClass: "bg-muted",
    iconColorClass: "text-muted-foreground",
  },
];

const ResultsBreakdown = ({ answers }: ResultsBreakdownProps) => {
  const grouped = groups.map((group) => ({
    ...group,
    items: findabilityQuestions.filter((q) => answers[q.id] === group.key),
  }));

  return (
    <div className="space-y-4">
      <h2 className="font-display text-base font-semibold text-foreground text-center">
        Your Breakdown
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {grouped
          .filter((g) => g.items.length > 0)
          .map((group) => {
            const Icon = group.icon;
            return (
              <div
                key={group.key}
                className={cn(
                  "rounded-2xl border p-4 space-y-3",
                  group.bgClass
                )}
              >
                {/* Group header */}
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center",
                      group.iconBgClass
                    )}
                  >
                    <Icon className={cn("w-3.5 h-3.5", group.iconColorClass)} />
                  </div>
                  <span className="font-body text-sm font-semibold text-foreground">
                    {group.title}
                  </span>
                  <span className="font-body text-xs text-muted-foreground ml-auto">
                    {group.items.length}
                  </span>
                </div>

                {/* Items */}
                <div className="space-y-2">
                  {group.items.map((question) => {
                    const guidance = question.guidance[group.key];
                    // Truncate guidance to first sentence
                    const shortGuidance =
                      guidance.split(/[.!]/).filter(Boolean)[0]?.trim() + ".";

                    return (
                      <div
                        key={question.id}
                        className="space-y-0.5"
                      >
                        <p className="font-body text-sm font-medium text-foreground/90">
                          {question.categoryLabel}
                        </p>
                        <p className="font-body text-xs text-muted-foreground leading-relaxed">
                          {shortGuidance}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default ResultsBreakdown;
