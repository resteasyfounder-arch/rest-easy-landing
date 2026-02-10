import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { getSafeRemyPath } from "@/lib/remyNavigation";
import { openRemyLauncher } from "@/lib/remyLauncherEvents";
import type { RemySurfacePayload } from "@/types/remy";

interface RemyBriefCardProps {
  payload: RemySurfacePayload | null;
  isLoading?: boolean;
  error?: string | null;
  onDismiss?: (nudgeId: string) => Promise<void> | void;
  onAcknowledge?: (actionId: string, targetHref?: string) => Promise<void> | void;
  onRetry?: () => Promise<void> | void;
  className?: string;
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

  const summaryText = useMemo(() => {
    if (!payload) return "";
    if (payload.nudge?.body) return payload.nudge.body;
    return payload.reassurance.body;
  }, [payload]);

  if (isLoading) {
    return (
      <Card className={cn("border-primary/20 bg-gradient-to-br from-primary/5 to-background", className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-5 w-32" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-8 w-28" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn("border-amber-300/40 bg-amber-50/40 dark:bg-amber-950/10", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-base">Remy Snapshot</CardTitle>
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
    if (!payload.nudge?.cta) return;
    const safeTarget = getSafeRemyPath(payload.nudge.cta.href, "/dashboard");
    if (onAcknowledge) {
      await onAcknowledge(payload.nudge.id, safeTarget);
    }
    navigate(safeTarget);
  };

  return (
    <Card className={cn("border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="font-display text-lg">Remy Snapshot</CardTitle>
          </div>
          <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
            Companion
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {payload.nudge && <p className="text-sm font-medium text-foreground">{payload.nudge.title}</p>}
        <p className="text-sm text-muted-foreground">{summaryText}</p>

        <div className="flex flex-wrap gap-2">
          {payload.nudge?.cta && (
            <Button size="sm" onClick={handlePrimaryAction}>
              {payload.nudge.cta.label}
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => openRemyLauncher()}
          >
            <MessageCircle className="h-3.5 w-3.5" />
            Chat with Remy
          </Button>
          {payload.nudge && onDismiss && (
            <Button variant="ghost" size="sm" onClick={() => onDismiss(payload.nudge!.id)}>
              Not now
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default RemyBriefCard;
