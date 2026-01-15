import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserCircle, ArrowRight } from "lucide-react";

interface ProfilePromptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartProfile: () => void;
  onSkip: () => void;
  completedCount: number;
  totalCount: number;
}

export function ProfilePromptModal({
  open,
  onOpenChange,
  onStartProfile,
  onSkip,
  completedCount,
  totalCount,
}: ProfilePromptModalProps) {
  const remaining = totalCount - completedCount;
  const hasStarted = completedCount > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center pb-2">
          <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
            <UserCircle className="w-10 h-10 text-primary" />
          </div>
          <DialogTitle className="font-display text-2xl text-center">
            {hasStarted ? "Almost there!" : "Before we begin..."}
          </DialogTitle>
          <DialogDescription className="font-body text-base text-foreground/80 text-center pt-3 leading-relaxed">
            {hasStarted ? (
              <>
                You've answered {completedCount} of {totalCount} questions.
                <br />
                Just {remaining} more to complete your profile.
              </>
            ) : (
              <>
                We'd love to learn a little about you first.
                <br />
                Just {totalCount} simple questions — takes about a minute.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 pt-4">
          <Button
            size="lg"
            className="h-14 text-base font-body gap-2"
            onClick={onStartProfile}
          >
            {hasStarted ? "Continue" : "Let's do it"}
            <ArrowRight className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="lg"
            className="h-12 text-muted-foreground font-body"
            onClick={onSkip}
          >
            Skip for now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
