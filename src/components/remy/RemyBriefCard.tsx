import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { describeRemySourceRef } from "@/lib/remySourceRefs";
import { getSafeRemyPath } from "@/lib/remyNavigation";
import type { RemyPriority, RemySurfacePayload } from "@/types/remy";

interface RemyBriefCardProps {
  payload: RemySurfacePayload | null;
  isLoading?: boolean;
  error?: string | null;
  onDismiss?: (nudgeId: string) => Promise<void> | void;
  onAcknowledge?: (actionId: string, targetHref?: string) => Promise<void> | void;
  onRetry?: () => Promise<void> | void;
  className?: string;
}

function PriorityBadge({ priority }: { priority: RemyPriority }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide",
        priority === "HIGH" && "bg-rose-500/10 text-rose-700 dark:text-rose-300",
        priority === "MEDIUM" && "bg-amber-500/10 text-amber-700 dark:text-amber-300",
        priority === "LOW" && "bg-slate-500/10 text-slate-700 dark:text-slate-300",
      )}
    >
      {priority}
    </span>
  );
}

export function RemyBriefCard({
  payload,
  isLoading = false,
  error = null,
  onDismiss,
  onAcknowledge,
  onRetry,
  className,
}: RemyBriefCardProps) {
  const navigate = useNavigate();

  const priorities = useMemo(() => payload?.priorities.slice(0, 3) || [], [payload?.priorities]);
  const nudge = payload?.nudge;

  if (isLoading) {
    return (
      <Card className={cn("border-primary/20 bg-gradient-to-br from-primary/5 to-background", className)}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-5 w-36" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn("border-amber-300/40 bg-amber-50/40 dark:bg-amber-950/10", className)}>
        <CardHeader>
          <CardTitle className="font-display text-base">Remy Brief</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">{error}</p>
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              Retry
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (!payload) return null;

  const handlePrimaryAction = async () => {
    if (!nudge?.cta) return;
    const safeTarget = getSafeRemyPath(nudge.cta.href, "/dashboard");
    if (onAcknowledge) {
      await onAcknowledge(nudge.id, safeTarget);
    }
    navigate(safeTarget);
  };

  return (
    <Card className={cn("border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="font-display text-lg">Remy Brief</CardTitle>
          </div>
          <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
            Product Guidance
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {nudge && (
          <div className="space-y-2 rounded-lg border border-border/50 bg-card/60 p-3">
            <p className="text-sm font-medium text-foreground">{nudge.title}</p>
            <p className="text-sm text-muted-foreground">{nudge.body}</p>
            <div className="flex flex-wrap gap-2 pt-1">
              {nudge.cta && (
                <Button size="sm" className="gap-1.5" onClick={handlePrimaryAction}>
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

        {priorities.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Priorities
            </p>
            <div className="space-y-2">
              {priorities.map((item) => (
                <button
                  key={item.id}
                  className="w-full rounded-lg border border-border/50 p-3 text-left hover:bg-muted/40 transition-colors"
                  onClick={async () => {
                    const safeTarget = getSafeRemyPath(item.target_href, "/dashboard");
                    if (onAcknowledge) await onAcknowledge(item.id, safeTarget);
                    navigate(safeTarget);
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium text-foreground leading-snug">{item.title}</p>
                    <PriorityBadge priority={item.priority} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{item.why_now}</p>
                </button>
              ))}
            </div>
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

export default RemyBriefCard;
