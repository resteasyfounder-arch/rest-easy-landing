import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { RoadmapItem } from "@/types/assessment";
import { supabase } from "@/integrations/supabase/client";

// Standard answer scoring map
const ANSWER_SCORES: Record<string, number | null> = {
  yes: 1.0,
  partial: 0.5,
  no: 0.0,
  not_sure: 0.25,
  na: null,
};

interface QuestionEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: RoadmapItem | null;
  onSuccess: () => void;
}

export function QuestionEditModal({
  open,
  onOpenChange,
  item,
  onSuccess,
}: QuestionEditModalProps) {
  const [selectedValue, setSelectedValue] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  // Reset selection when modal opens with new item
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSelectedValue("");
    }
    onOpenChange(newOpen);
  };

  const handleSave = async () => {
    if (!item || !selectedValue) return;

    const selectedOption = item.improvement_options.find(
      (opt) => opt.value === selectedValue
    );
    if (!selectedOption) return;

    const scoreFraction = ANSWER_SCORES[selectedValue];

    setIsSaving(true);
    try {
      const { error } = await supabase.functions.invoke("agent", {
        body: {
          action: "save_answers",
          assessment_id: "readiness_v1",
          answers: [
            {
              question_id: item.question_id,
              item_id: item.question_id,
              section_id: item.section_id,
              dimension: item.section_id,
              answer_value: selectedValue,
              answer_label: selectedOption.label,
              score_fraction: scoreFraction,
              question_text: item.question_text,
            },
          ],
        },
      });

      if (error) {
        throw error;
      }

      toast.success("Answer updated successfully");
      setSelectedValue("");
      onSuccess();
    } catch (error) {
      console.error("[QuestionEditModal] Save error:", error);
      toast.error("Failed to update answer. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Update Your Answer</DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-3 pt-2">
              <Badge variant="secondary" className="font-normal">
                {item.section_label}
              </Badge>
              <p className="text-sm text-foreground font-medium leading-relaxed">
                {item.question_text}
              </p>
              <p className="text-xs text-muted-foreground">
                Current answer:{" "}
                <span className="text-amber-600 dark:text-amber-400">
                  {item.current_answer_label}
                </span>
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-3">
            Select a new answer:
          </p>
          {item.improvement_options.length > 0 ? (
            <RadioGroup
              value={selectedValue}
              onValueChange={setSelectedValue}
              className="space-y-2"
            >
              {item.improvement_options.map((option) => (
                <div
                  key={option.value}
                  className={cn(
                    "flex items-center space-x-3 rounded-lg border p-3 transition-colors cursor-pointer",
                    selectedValue === option.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/50"
                  )}
                  onClick={() => setSelectedValue(option.value)}
                >
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label
                    htmlFor={option.value}
                    className="flex-1 cursor-pointer text-sm font-normal"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No improvement options available.
            </p>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!selectedValue || isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default QuestionEditModal;
