import { useCallback, useEffect, useRef, useState } from "react";
import type { RemySurface, RemySurfacePayload } from "@/types/remy";
import { parseRemySurfacePayload } from "@/lib/remySchema";
import { supabase } from "@/integrations/supabase/client";

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
  const { data, error } = await supabase.functions.invoke("remy", {
    body: payload,
  });

  if (error) {
    throw error;
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
    if (!enabled) {
      setPayload(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const requestPayload: Record<string, unknown> = {
        action: "get_surface_payload",
        assessment_id: "readiness_v1",
        surface,
      };
      if (subjectId) {
        requestPayload.subject_id = subjectId;
      }
      if (sectionId) {
        requestPayload.section_id = sectionId;
      }

      const data = await callRemy(requestPayload);
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
      const requestPayload: Record<string, unknown> = {
        action: "dismiss_nudge",
        assessment_id: "readiness_v1",
        nudge_id: nudgeId,
        ttl_hours: ttlHours,
      };
      if (subjectId) {
        requestPayload.subject_id = subjectId;
      }

      await callRemy(requestPayload);
      await refresh();
    },
    [subjectId, refresh],
  );

  const acknowledgeAction = useCallback(
    async (actionId: string, targetHref?: string) => {
      const requestPayload: Record<string, unknown> = {
        action: "ack_action",
        assessment_id: "readiness_v1",
        surface,
        action_id: actionId,
        target_href: targetHref,
      };
      if (subjectId) {
        requestPayload.subject_id = subjectId;
      }

      await callRemy(requestPayload);
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
