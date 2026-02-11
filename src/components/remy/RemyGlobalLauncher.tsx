import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/context/AuthContext";
import { useRemySurface } from "@/hooks/useRemySurface";
import { RemyCompanionChat } from "@/components/remy/RemyCompanionChat";
import { RemyGuestChat } from "@/components/remy/RemyGuestChat";
import { getSafeRemyPath } from "@/lib/remyNavigation";
import { REMY_OPEN_LAUNCHER_EVENT } from "@/lib/remyLauncherEvents";
import { getUserFirstName } from "@/lib/userDisplayName";
import { cn } from "@/lib/utils";
import type { RemySurface } from "@/types/remy";

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
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const openTrackedAtRef = useRef(0);

  const surface = useMemo(() => getRouteSurface(location.pathname), [location.pathname]);
  const routeLabel = useMemo(() => getRouteLabel(location.pathname), [location.pathname]);
  const firstName = useMemo(() => getUserFirstName(user), [user]);
  const personalizedEnabled = Boolean(surface && isAuthenticated);
  const isGuestSurface = !personalizedEnabled;
  const remyUiV2Enabled = (import.meta.env.VITE_REMY_CHAT_UI_V2 ?? "true").toLowerCase() !== "false";

  const {
    payload,
    isLoading,
    error,
    dismissNudge,
    acknowledgeAction,
    trackEvent,
    refresh,
    chatTurn,
  } = useRemySurface({
    subjectId: null,
    surface: surface || "dashboard",
    enabled: personalizedEnabled,
  });

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleOpen = () => {
      setOpen(true);
    };
    window.addEventListener(REMY_OPEN_LAUNCHER_EVENT, handleOpen);
    return () => {
      window.removeEventListener(REMY_OPEN_LAUNCHER_EVENT, handleOpen);
    };
  }, []);

  useEffect(() => {
    if (!open || isGuestSurface || !surface) return;
    const now = Date.now();
    if (now - openTrackedAtRef.current < 500) return;
    openTrackedAtRef.current = now;
    void trackEvent("remy_chat_opened", {
      route: location.pathname,
      surface,
    }).catch(() => undefined);
  }, [open, isGuestSurface, surface, location.pathname, trackEvent]);

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
          "fixed right-4 z-[70] flex flex-col items-end gap-2",
          isAppRouteOnMobile ? "bottom-24" : "bottom-5",
        )}
      >
        {!open && !isGuestSurface && payload?.nudge && (
          <button
            className="max-w-[280px] rounded-full border border-primary/25 bg-background/95 px-3 py-1.5 text-left shadow-lg backdrop-blur"
            onClick={() => setOpen(true)}
          >
            <p className="truncate text-xs text-muted-foreground">Remy tip</p>
            <p className="truncate text-sm font-medium text-foreground">{payload.nudge.title}</p>
          </button>
        )}

        <div
          className={cn(
            "flex w-[min(94vw,380px)] h-[min(72vh,620px)] min-h-[430px] flex-col overflow-hidden rounded-2xl border border-primary/30 bg-background/95 shadow-2xl backdrop-blur transition-all",
            open ? "pointer-events-auto opacity-100 translate-y-0" : "pointer-events-none opacity-0 translate-y-2",
          )}
        >
          <div className="flex items-center justify-between gap-3 border-b border-border/60 px-3 py-2.5">
            <div>
              <p className="text-sm font-semibold text-foreground">Remy</p>
              <p className="text-xs text-muted-foreground">{routeLabel}</p>
            </div>
            <div className="flex items-center gap-1">
              {!isGuestSurface && (
                <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
                  Companion
                </Badge>
              )}
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex-1 min-h-0 p-3">
            {isGuestSurface ? (
              <RemyGuestChat className="h-full" onNavigate={() => setOpen(false)} />
            ) : (
              <RemyCompanionChat
                className="h-full"
                payload={payload}
                isLoading={isLoading}
                error={error}
                userName={firstName}
                sessionKey={user?.id ?? null}
                uiV2Enabled={remyUiV2Enabled}
                onDismiss={(nudgeId) => dismissNudge(nudgeId, 24)}
                onRetry={refresh}
                onTrackEvent={trackEvent}
                onChatTurn={chatTurn}
                onNavigateAction={async (actionId, href) => {
                  const safeTarget = getSafeRemyPath(href, "/dashboard");
                  await acknowledgeAction(actionId, safeTarget);
                  setOpen(false);
                  navigate(safeTarget);
                }}
              />
            )}
          </div>
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
