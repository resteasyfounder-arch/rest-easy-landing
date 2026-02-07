import { useCallback, useEffect, useRef, useState } from "react";
import type { RemySurface, RemySurfacePayload } from "@/types/remy";
import { parseRemySurfacePayload } from "@/lib/remySchema";

const SUPABASE_URL = "https://ltldbteqkpxqohbwqvrn.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0bGRidGVxa3B4cW9oYndxdnJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5OTY0MjUsImV4cCI6MjA4MzU3MjQyNX0.zSWhg_zFbrDhIA9egmaRsGsRiQg7Pd9fgHyTp39v3CE";
export const REMY_REFRESH_EVENT = "remy:refresh";

interface UseRemySurfaceOptions {
  subjectId: string | null;
  surface: RemySurface;
  sectionId?: string;
  enabled?: boolean;
}

interface UseRemySurfaceReturn {
  payload: RemySurfacePayload | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  dismissNudge: (nudgeId: string, ttlHours?: number) => Promise<void>;
  acknowledgeAction: (actionId: string, targetHref?: string) => Promise<void>;
}

export function notifyRemyRefresh() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(REMY_REFRESH_EVENT));
  }
}

async function callRemy(payload: Record<string, unknown>) {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/remy`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    const message = typeof data?.error === "string" ? data.error : "Remy request failed";
    throw new Error(message);
  }
  return data;
}

export function useRemySurface({
  subjectId,
  surface,
  sectionId,
  enabled = true,
}: UseRemySurfaceOptions): UseRemySurfaceReturn {
  const [payload, setPayload] = useState<RemySurfacePayload | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const refresh = useCallback(async () => {
    if (!subjectId || !enabled) {
      setPayload(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await callRemy({
        action: "get_surface_payload",
        subject_id: subjectId,
        assessment_id: "readiness_v1",
        surface,
        section_id: sectionId,
      });
      if (mountedRef.current) {
        setPayload(parseRemySurfacePayload(data));
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : "Failed to load Remy guidance");
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [subjectId, surface, sectionId, enabled]);

  const dismissNudge = useCallback(
    async (nudgeId: string, ttlHours = 24) => {
      if (!subjectId) return;
      await callRemy({
        action: "dismiss_nudge",
        subject_id: subjectId,
        assessment_id: "readiness_v1",
        nudge_id: nudgeId,
        ttl_hours: ttlHours,
      });
      await refresh();
    },
    [subjectId, refresh],
  );

  const acknowledgeAction = useCallback(
    async (actionId: string, targetHref?: string) => {
      if (!subjectId) return;
      await callRemy({
        action: "ack_action",
        subject_id: subjectId,
        assessment_id: "readiness_v1",
        surface,
        action_id: actionId,
        target_href: targetHref,
      });
    },
    [subjectId, surface],
  );

  useEffect(() => {
    mountedRef.current = true;
    refresh();
    return () => {
      mountedRef.current = false;
    };
  }, [refresh]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = () => {
      void refresh();
    };
    window.addEventListener(REMY_REFRESH_EVENT, handler);
    return () => {
      window.removeEventListener(REMY_REFRESH_EVENT, handler);
    };
  }, [refresh]);

  return {
    payload,
    isLoading,
    error,
    refresh,
    dismissNudge,
    acknowledgeAction,
  };
}

export default useRemySurface;
