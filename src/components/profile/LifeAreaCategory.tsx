import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { LifeAreaCard } from "./LifeAreaCard";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface ProfileItem {
  id: string;
  label: string;
  icon: LucideIcon;
  fieldPath: string;
}

interface LifeAreaCategoryProps {
  title: string;
  items: ProfileItem[];
  answers: Record<string, "yes" | "no" | null>;
  questionPrompts: Record<string, string>;
  unlockHints: Record<string, string>;
  onAnswer: (questionId: string, value: "yes" | "no") => void;
  disabled?: boolean;
  defaultOpen?: boolean;
}

export function LifeAreaCategory({
  title,
  items,
  answers,
  questionPrompts,
  unlockHints,
  onAnswer,
  disabled = false,
  defaultOpen = true,
}: LifeAreaCategoryProps) {
  const completedCount = items.filter(item => answers[item.id] !== null).length;
  const totalCount = items.length;

  return (
    <Accordion type="single" collapsible defaultValue={defaultOpen ? "category" : undefined}>
      <AccordionItem value="category" className="border-none">
        <AccordionTrigger className="hover:no-underline py-3 px-1">
          <div className="flex items-center justify-between w-full pr-2">
            <span className="text-sm font-body font-semibold text-muted-foreground uppercase tracking-wider">
              {title}
            </span>
            <span className={cn(
              "text-xs font-body px-2 py-0.5 rounded-full",
              completedCount === totalCount 
                ? "bg-primary/10 text-primary" 
                : "bg-muted text-muted-foreground"
            )}>
              {completedCount}/{totalCount}
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-2 pb-0">
          <div className="space-y-3">
            {items.map((item) => (
              <LifeAreaCard
                key={item.id}
                id={item.id}
                label={item.label}
                icon={item.icon}
                questionPrompt={questionPrompts[item.id] || `Does this apply to your life?`}
                currentValue={answers[item.id] ?? null}
                unlockHint={unlockHints[item.id]}
                onAnswer={(value) => onAnswer(item.id, value)}
                disabled={disabled}
              />
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
