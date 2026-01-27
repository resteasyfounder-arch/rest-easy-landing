import { useState, useEffect, useCallback } from "react";
import type { RoadmapItem, CompletedItem, ImprovementItemsResponse } from "@/types/assessment";

const SUPABASE_URL = "https://ltldbteqkpxqohbwqvrn.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0bGRidGVxa3B4cW9oYndxdnJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5OTY0MjUsImV4cCI6MjA4MzU3MjQyNX0.zSWhg_zFbrDhIA9egmaRsGsRiQg7Pd9fgHyTp39v3CE";

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

  const fetchItems = useCallback(async () => {
    if (!subjectId || !enabled) {
      setItems([]);
      setCompletedItems([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/agent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          apikey: SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          action: "get_improvement_items",
          subject_id: subjectId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch improvement items");
      }

      const data: ImprovementItemsResponse = await response.json();
      
      setItems(data.items || []);
      setCompletedItems(data.completed_items || []);
      setTotalApplicable(data.total_applicable || 0);
      setTotalAnswered(data.total_answered || 0);
    } catch (err) {
      console.error("[useImprovementItems] Error:", err);
      setError(err instanceof Error ? err.message : "Failed to load items");
    } finally {
      setIsLoading(false);
    }
  }, [subjectId, enabled]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return {
    items,
    completedItems,
    totalApplicable,
    totalAnswered,
    isLoading,
    error,
    refresh: fetchItems,
  };
}

export default useImprovementItems;
