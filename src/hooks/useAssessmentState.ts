import { useState, useEffect, useCallback, useRef } from "react";
import type {
  AssessmentState,
  LocalAssessmentState,
  SyncStatus,
  ScoreTier,
} from "@/types/assessment";

const SUPABASE_URL = "https://ltldbteqkpxqohbwqvrn.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0bGRidGVxa3B4cW9oYndxdnJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5OTY0MjUsImV4cCI6MjA4MzU3MjQyNX0.zSWhg_zFbrDhIA9egmaRsGsRiQg7Pd9fgHyTp39v3CE";

const STORAGE_KEYS = {
  subjectId: "rest-easy.readiness.subject_id",
  assessmentId: "rest-easy.readiness.assessment_id",
  cachedState: "rest-easy.readiness.cached_state",
};

const ASSESSMENT_ID = "readiness_v1";

// Tier thresholds
function getTierFromScore(score: number): ScoreTier {
  if (score >= 85) return "Rest Easy Ready";
  if (score >= 65) return "Well Prepared";
  if (score >= 40) return "On Your Way";
  return "Getting Started";
}

// Create a default empty state
function createEmptyState(): AssessmentState {
  return {
    subject_id: "",
    assessment_id: "",
    status: "not_started",
    overall_score: 0,
    overall_progress: 0,
    tier: "Getting Started",
    profile_progress: 0,
    profile_complete: false,
    sections: [],
    current_section_id: null,
    current_question_id: null,
    next_question_id: null,
    report_status: "not_started",
    report_url: null,
    last_activity_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

interface UseAssessmentStateOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // ms
}

export function useAssessmentState(options: UseAssessmentStateOptions = {}) {
  const { autoRefresh = false, refreshInterval = 30000 } = options;
  
  const [state, setState] = useState<LocalAssessmentState>({
    serverState: null,
    syncStatus: "synced",
    lastSyncAt: null,
    error: null,
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  // Fetch current state from server
  const fetchState = useCallback(async (silent = false) => {
    const subjectId = localStorage.getItem(STORAGE_KEYS.subjectId);
    
    if (!subjectId) {
      // No existing session - return empty state
      const emptyState = createEmptyState();
      setState({
        serverState: emptyState,
        syncStatus: "synced",
        lastSyncAt: new Date(),
        error: null,
      });
      setIsLoading(false);
      return emptyState;
    }

    // Only show syncing indicator for non-silent fetches AND not initial load
    // This prevents constant spinner flicker during background auto-refreshes
    if (!silent && !isLoading) {
      setState((prev) => ({ ...prev, syncStatus: "syncing" }));
    }

    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/agent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          apikey: SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          action: "get_state",
          subject_id: subjectId,
          assessment_id: ASSESSMENT_ID,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch assessment state");
      }

      const data = await response.json();
      
      if (!mountedRef.current) return null;

      const serverState = data.assessment_state || createEmptyState();
      
      // Cache state
      localStorage.setItem(STORAGE_KEYS.cachedState, JSON.stringify(serverState));

      setState({
        serverState,
        syncStatus: "synced",
        lastSyncAt: new Date(),
        error: null,
      });
      
      return serverState;
    } catch (error) {
      if (!mountedRef.current) return null;
      
      // Try to use cached state on error
      const cached = localStorage.getItem(STORAGE_KEYS.cachedState);
      const cachedState = cached ? JSON.parse(cached) : createEmptyState();
      
      setState({
        serverState: cachedState,
        syncStatus: "error",
        lastSyncAt: state.lastSyncAt,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      
      return cachedState;
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [state.lastSyncAt]);

  // Initialize on mount
  useEffect(() => {
    mountedRef.current = true;
    fetchState();
    
    return () => {
      mountedRef.current = false;
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [fetchState]);

  // Auto-refresh
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      refreshTimerRef.current = setInterval(() => {
        fetchState(true);
      }, refreshInterval);
      
      return () => {
        if (refreshTimerRef.current) {
          clearInterval(refreshTimerRef.current);
        }
      };
    }
  }, [autoRefresh, refreshInterval, fetchState]);

  // Refresh on visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchState(true);
      }
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchState]);

  // Computed values with fallbacks
  const assessmentState = state.serverState || createEmptyState();
  
  const hasStarted = assessmentState.status !== "not_started";
  const isComplete = assessmentState.status === "completed";
  const isReportReady = assessmentState.report_status === "ready";
  const isReportGenerating = assessmentState.report_status === "generating";

  // Manual refresh
  const refresh = useCallback(() => {
    return fetchState(false);
  }, [fetchState]);

  // Clear local state (for logout/reset)
  const clearState = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.subjectId);
    localStorage.removeItem(STORAGE_KEYS.assessmentId);
    localStorage.removeItem(STORAGE_KEYS.cachedState);
    setState({
      serverState: createEmptyState(),
      syncStatus: "synced",
      lastSyncAt: null,
      error: null,
    });
  }, []);

  return {
    // State
    assessmentState,
    isLoading,
    syncStatus: state.syncStatus,
    lastSyncAt: state.lastSyncAt,
    error: state.error,
    
    // Computed
    hasStarted,
    isComplete,
    isReportReady,
    isReportGenerating,
    
    // Actions
    refresh,
    clearState,
    
    // Utilities
    getTierFromScore,
  };
}

export type { AssessmentState, LocalAssessmentState, SyncStatus, ScoreTier };
