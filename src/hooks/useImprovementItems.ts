import { useState, useEffect, useCallback, useRef } from "react";
import type { RoadmapItem, CompletedItem, ImprovementItemsResponse } from "@/types/assessment";
import { invokeAuthedFunction } from "@/lib/invokeAuthedFunction";

interface UseImprovementItemsOptions {
  subjectId: string | null;
  enabled?: boolean;
}

interface UseImprovementItemsReturn {
  items: RoadmapItem[];
  completedItems: CompletedItem[];
  totalApplicable: number;
  totalAnswered: number;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useImprovementItems({
  subjectId,
  enabled = true,
}: UseImprovementItemsOptions): UseImprovementItemsReturn {
  const [items, setItems] = useState<RoadmapItem[]>([]);
  const [completedItems, setCompletedItems] = useState<CompletedItem[]>([]);
  const [totalApplicable, setTotalApplicable] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const lastFetchRef = useRef<number>(0);

  const fetchItems = useCallback(async (silent = false) => {
    if (!enabled) {
      setItems([]);
      setCompletedItems([]);
      return;
    }

    // Debounce: skip if fetched within last 500ms
    const now = Date.now();
    if (now - lastFetchRef.current < 500) {
      return;
    }
    lastFetchRef.current = now;

    if (!silent) {
      setIsLoading(true);
    }
    setError(null);

    try {
      const payload: Record<string, unknown> = {
        action: "get_improvement_items",
      };
      if (subjectId) {
        payload.subject_id = subjectId;
      }

      const parsedData = await invokeAuthedFunction<ImprovementItemsResponse | null>(
        "agent",
        payload,
      );
      if (!parsedData) {
        throw new Error("Failed to fetch improvement items");
      }

      if (mountedRef.current) {
        setItems(parsedData.items || []);
        setCompletedItems(parsedData.completed_items || []);
        setTotalApplicable(parsedData.total_applicable || 0);
        setTotalAnswered(parsedData.total_answered || 0);
      }
    } catch (err) {
      console.error("[useImprovementItems] Error:", err);
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : "Failed to load items");
      }
    } finally {
      if (mountedRef.current && !silent) {
        setIsLoading(false);
      }
    }
  }, [subjectId, enabled]);

  // Initial fetch, cleanup, and auto-refresh listeners (consolidated into single useEffect)
  useEffect(() => {
    mountedRef.current = true;
    fetchItems();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && enabled) {
        fetchItems(true);
      }
    };

    const handleFocus = () => {
      if (enabled) {
        fetchItems(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    
    return () => {
      mountedRef.current = false;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [fetchItems, enabled]);

  return {
    items,
    completedItems,
    totalApplicable,
    totalAnswered,
    isLoading,
    error,
    refresh: () => fetchItems(false),
  };
}

export default useImprovementItems;
