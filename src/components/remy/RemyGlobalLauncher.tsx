import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/context/AuthContext";
import { useRemySurface } from "@/hooks/useRemySurface";
import { RemyGuestChat } from "@/components/remy/RemyGuestChat";
import { describeRemySourceRef } from "@/lib/remySourceRefs";
import { getSafeRemyPath } from "@/lib/remyNavigation";
import { cn } from "@/lib/utils";
import type { RemySurface } from "@/types/remy";

const STORAGE_KEYS = {
  subjectId: "rest-easy.readiness.subject_id",
};
const REMY_OPEN_LAUNCHER_EVENT = "remy:open-launcher";

function getRouteSurface(pathname: string): RemySurface | null {
  if (pathname.startsWith("/dashboard")) return "dashboard";
  if (pathname.startsWith("/readiness")) return "readiness";
  if (pathname.startsWith("/results")) return "results";
  if (pathname.startsWith("/profile")) return "profile";
  if (pathname.startsWith("/menu")) return "menu";
  return null;
}

function getRouteLabel(pathname: string): string {
  if (pathname.startsWith("/dashboard")) return "Dashboard Guidance";
  if (pathname.startsWith("/readiness")) return "Readiness Guidance";
  if (pathname.startsWith("/results")) return "Results Guidance";
  if (pathname.startsWith("/profile")) return "Profile Guidance";
  if (pathname.startsWith("/menu")) return "Menu Guidance";
  if (pathname.startsWith("/assessment")) return "Findability Guidance";
  if (pathname.startsWith("/login")) return "Sign-in Guidance";
  return "Guest Guidance";
}

export function RemyGlobalLauncher() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [subjectId, setSubjectId] = useState<string | null>(() => localStorage.getItem(STORAGE_KEYS.subjectId));

  const surface = useMemo(() => getRouteSurface(location.pathname), [location.pathname]);
  const routeLabel = useMemo(() => getRouteLabel(location.pathname), [location.pathname]);
  const personalizedEnabled = Boolean(surface && subjectId && isAuthenticated);
  const isGuestSurface = !personalizedEnabled;

  const {
    payload,
    isLoading,
    error,
    dismissNudge,
    acknowledgeAction,
    refresh,
  } = useRemySurface({
    subjectId,
    surface: surface || "dashboard",
    enabled: personalizedEnabled,
  });

  useEffect(() => {
    setOpen(false);
    setSubjectId(localStorage.getItem(STORAGE_KEYS.subjectId));
  }, [location.pathname]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleOpen = () => setOpen(true);
    window.addEventListener(REMY_OPEN_LAUNCHER_EVENT, handleOpen);
    return () => {
      window.removeEventListener(REMY_OPEN_LAUNCHER_EVENT, handleOpen);
    };
  }, []);

  const hasActionableNudge = !isGuestSurface && Boolean(payload?.nudge);
  const isAppRouteOnMobile = isMobile && (
    location.pathname.startsWith("/profile") ||
    location.pathname.startsWith("/assessment") ||
    location.pathname.startsWith("/readiness") ||
    location.pathname.startsWith("/results") ||
    location.pathname.startsWith("/menu") ||
    location.pathname.startsWith("/dashboard")
  );

  return (
    <>
      <div
        className={cn(
          "fixed right-4 z-[70] flex flex-col items-end gap-3",
          isAppRouteOnMobile ? "bottom-24" : "bottom-5",
        )}
      >
        <div
          className={cn(
            "w-[min(92vw,380px)] rounded-2xl border border-primary/30 bg-background/95 p-4 shadow-2xl backdrop-blur transition-all",
            open ? "pointer-events-auto opacity-100 translate-y-0" : "pointer-events-none opacity-0 translate-y-2",
          )}
        >
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Remy</p>
              <p className="text-xs text-muted-foreground">{routeLabel}</p>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {isGuestSurface ? (
            <RemyGuestChat onNavigate={() => setOpen(false)} />
          ) : (
            <div className="space-y-3">
              {isLoading && <p className="text-sm text-muted-foreground">Loading personalized guidance...</p>}
              {error && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{error}</p>
                  <Button size="sm" variant="outline" onClick={refresh}>
                    Retry
                  </Button>
                </div>
              )}
              {!isLoading && !error && payload && (
                <>
                  {payload.nudge && (
                    <div className="rounded-xl border border-border/60 bg-card/70 p-3">
                      <p className="text-sm font-medium text-foreground">{payload.nudge.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{payload.nudge.body}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {payload.nudge.cta && (
                          <Button
                            size="sm"
                            className="gap-1.5"
                            onClick={async () => {
                              const safeTarget = getSafeRemyPath(payload.nudge?.cta?.href, "/dashboard");
                              await acknowledgeAction(payload.nudge!.id, safeTarget);
                              setOpen(false);
                              navigate(safeTarget);
                            }}
                          >
                            {payload.nudge.cta.label}
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => dismissNudge(payload.nudge!.id, 24)}>
                          Not now
                        </Button>
                      </div>
                    </div>
                  )}

                  {payload.explanations.length > 0 && (
                    <details className="rounded-xl border border-border/60 bg-card/70 p-3">
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

                  {payload.priorities.length > 0 && (
                    <div className="space-y-2">
                      {payload.priorities.slice(0, 2).map((priority) => (
                        <button
                          key={priority.id}
                          className="w-full rounded-xl border border-border/60 bg-card/70 p-3 text-left"
                          onClick={async () => {
                            const safeTarget = getSafeRemyPath(priority.target_href, "/dashboard");
                            await acknowledgeAction(priority.id, safeTarget);
                            setOpen(false);
                            navigate(safeTarget);
                          }}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-semibold text-foreground">{priority.title}</p>
                            <Badge variant="secondary" className="text-[10px]">
                              {priority.priority}
                            </Badge>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">{priority.why_now}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <Button
          size="lg"
          className="relative h-12 rounded-full px-4 shadow-xl"
          onClick={() => setOpen((prev) => !prev)}
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Remy Guide
          {!open && hasActionableNudge && (
            <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-rose-500" />
          )}
        </Button>
      </div>
    </>
  );
}

export default RemyGlobalLauncher;
