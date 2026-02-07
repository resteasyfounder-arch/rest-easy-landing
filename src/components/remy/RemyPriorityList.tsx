import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { describeRemySourceRef } from "@/lib/remySourceRefs";
import { getSafeRemyPath } from "@/lib/remyNavigation";
import type { RemyPriority, RemySurfacePayload } from "@/types/remy";

interface RemyPriorityListProps {
  payload: RemySurfacePayload | null;
  isLoading?: boolean;
  error?: string | null;
  onDismiss?: (nudgeId: string) => Promise<void> | void;
  onAcknowledge?: (actionId: string, targetHref?: string) => Promise<void> | void;
  className?: string;
}

function PriorityBadge({ priority }: { priority: RemyPriority }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide",
        priority === "HIGH" && "bg-rose-500/10 text-rose-700",
        priority === "MEDIUM" && "bg-amber-500/10 text-amber-700",
        priority === "LOW" && "bg-slate-500/10 text-slate-700",
      )}
    >
      {priority}
    </span>
  );
}

export function RemyPriorityList({
  payload,
  isLoading = false,
  error = null,
  onDismiss,
  onAcknowledge,
  className,
}: RemyPriorityListProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card className={cn("border-primary/20 bg-primary/5", className)}>
        <CardHeader>
          <CardTitle className="font-display text-xl">Remy Priorities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 animate-pulse">
          <div className="h-4 w-full rounded bg-primary/20" />
          <div className="h-4 w-5/6 rounded bg-primary/20" />
          <div className="h-4 w-4/6 rounded bg-primary/20" />
        </CardContent>
      </Card>
    );
  }

  if (error || !payload) return null;

  const nudge = payload.nudge;

  return (
    <Card className={cn("border-primary/20 bg-gradient-to-br from-primary/5 to-background", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="font-display text-xl">Remy Priorities</CardTitle>
          </div>
          <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
            Feature Guidance
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {nudge && (
          <div className="rounded-lg border border-border/50 bg-card/60 p-3 space-y-2">
            <p className="text-sm font-medium text-foreground">{nudge.title}</p>
            <p className="text-sm text-muted-foreground">{nudge.body}</p>
            <div className="flex flex-wrap gap-2">
              {nudge.cta && (
                <Button
                  size="sm"
                  className="gap-1.5"
                  onClick={async () => {
                    const safeTarget = getSafeRemyPath(nudge.cta?.href, "/results");
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
          </div>
        )}

        {payload.priorities.length > 0 && (
          <div className="space-y-2">
            {payload.priorities.map((priority) => (
              <button
                key={priority.id}
                className="w-full rounded-lg border border-border/50 p-3 text-left hover:bg-muted/40 transition-colors"
                onClick={async () => {
                  const safeTarget = getSafeRemyPath(priority.target_href, "/results");
                  if (onAcknowledge) await onAcknowledge(priority.id, safeTarget);
                  navigate(safeTarget);
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium text-foreground">{priority.title}</p>
                  <PriorityBadge priority={priority.priority} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{priority.why_now}</p>
              </button>
            ))}
          </div>
        )}

        {payload.explanations.length > 0 && (
          <details className="rounded-lg border border-border/50 bg-card/60 p-3">
            <summary className="cursor-pointer text-sm font-medium text-foreground">
              Why this recommendation
            </summary>
            <div className="mt-2 space-y-2">
              {payload.explanations.slice(0, 2).map((item) => (
                <div key={item.id} className="space-y-1">
                  <p className="text-xs font-medium text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.body}</p>
                  <p className="text-[11px] text-muted-foreground/90">
                    Based on: {item.source_refs.slice(0, 2).map(describeRemySourceRef).join(" • ")}
                  </p>
                </div>
              ))}
            </div>
          </details>
        )}

        <div className="rounded-lg bg-primary/5 p-3">
          <p className="text-sm font-medium text-foreground">{payload.reassurance.title}</p>
          <p className="text-sm text-muted-foreground">{payload.reassurance.body}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default RemyPriorityList;
