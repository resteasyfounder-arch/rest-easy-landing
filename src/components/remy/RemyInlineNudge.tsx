import { useNavigate } from "react-router-dom";
import { AlertCircle, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { describeRemySourceRef } from "@/lib/remySourceRefs";
import { getSafeRemyPath } from "@/lib/remyNavigation";
import type { RemySurfacePayload } from "@/types/remy";

interface RemyInlineNudgeProps {
  payload: RemySurfacePayload | null;
  isLoading?: boolean;
  error?: string | null;
  onDismiss?: (nudgeId: string) => Promise<void> | void;
  onAcknowledge?: (actionId: string, targetHref?: string) => Promise<void> | void;
  className?: string;
}

export function RemyInlineNudge({
  payload,
  isLoading = false,
  error = null,
  onDismiss,
  onAcknowledge,
  className,
}: RemyInlineNudgeProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div
        className={cn(
          "rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 animate-pulse",
          className,
        )}
      >
        <div className="h-4 w-24 rounded bg-primary/20" />
        <div className="mt-2 h-4 w-full rounded bg-primary/20" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("rounded-xl border border-amber-300/40 bg-amber-50/50 px-4 py-3", className)}>
        <div className="flex items-center gap-2 text-amber-700">
          <AlertCircle className="h-4 w-4" />
          <p className="text-sm font-medium">Remy guidance unavailable</p>
        </div>
      </div>
    );
  }

  if (!payload?.nudge) return null;

  const nudge = payload.nudge;
  const topExplanation = payload.explanations[0];

  return (
    <div
      className={cn(
        "rounded-xl border border-primary/25 bg-gradient-to-br from-primary/10 to-background px-4 py-3",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 h-7 w-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <div className="min-w-0 flex-1 space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Remy</p>
          <p className="text-sm font-medium text-foreground">{nudge.title}</p>
          <p className="text-sm text-muted-foreground">{nudge.body}</p>
          {topExplanation && (
            <p className="text-xs text-muted-foreground/80">Why this: {topExplanation.body}</p>
          )}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {nudge.cta && (
              <Button
                size="sm"
                className="gap-1.5"
                onClick={async () => {
                  const safeTarget = getSafeRemyPath(nudge.cta?.href, "/readiness");
                  if (onAcknowledge) await onAcknowledge(nudge.id, safeTarget);
                  navigate(safeTarget);
                }}
              >
                {nudge.cta.label}
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            )}
            {onDismiss && (
              <Button variant="ghost" size="sm" onClick={() => onDismiss(nudge.id)}>
                Not now
              </Button>
            )}
          </div>

          {payload.explanations.length > 0 && (
            <details className="rounded-lg border border-border/50 bg-card/60 p-2">
              <summary className="cursor-pointer text-xs font-medium text-foreground">
                Why this recommendation
              </summary>
              <div className="mt-1 space-y-1">
                {payload.explanations.slice(0, 1).map((item) => (
                  <div key={item.id}>
                    <p className="text-xs text-muted-foreground">{item.body}</p>
                    <p className="text-[11px] text-muted-foreground/90">
                      Based on: {item.source_refs.slice(0, 2).map(describeRemySourceRef).join(" • ")}
                    </p>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}

export default RemyInlineNudge;
