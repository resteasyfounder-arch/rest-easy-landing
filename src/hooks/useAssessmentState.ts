import { useState, useEffect, useCallback, useRef } from "react";
import type {
  AssessmentState,
  LocalAssessmentState,
  SyncStatus,
  ScoreTier,
} from "@/types/assessment";
import type { ReadinessReport } from "@/types/report";
import { supabase } from "@/integrations/supabase/client";

// Only keep subject_id in localStorage for session continuity
const STORAGE_KEYS = {
  subjectId: "rest-easy.readiness.subject_id",
};

const ASSESSMENT_ID = "readiness_v1";

async function callAgent(payload: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke("agent", {
    body: payload,
  });
  if (error) {
    throw error;
  }
  return data as Record<string, unknown>;
}

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
    profile_answers: {},
    profile_data: {},
    sections: [],
    current_section_id: null,
    current_question_id: null,
    next_question_id: null,
    report_status: "not_started",
    report_url: null,
    report_stale: false,
    last_activity_at: new Date().toISOString(),
    last_answer_at: null,
    updated_at: new Date().toISOString(),
  };
}

interface UseAssessmentStateOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // ms
  includeReportPreview?: boolean; // fetch report data for completed assessments
}

export function useAssessmentState(options: UseAssessmentStateOptions = {}) {
  const { autoRefresh = false, refreshInterval = 30000, includeReportPreview = false } = options;
  
  const [state, setState] = useState<LocalAssessmentState>({
    serverState: null,
    syncStatus: "synced",
    lastSyncAt: null,
    error: null,
  });
  
  const [reportPreview, setReportPreview] = useState<ReadinessReport | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  
  const [isLoading, setIsLoading] = useState(true);
  const isLoadingRef = useRef(true);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  // Fetch current state from server
  const fetchState = useCallback(async (silent = false) => {
    // Only show syncing indicator for non-silent fetches AND not initial load
    // This prevents constant spinner flicker during background auto-refreshes
    if (!silent && !isLoadingRef.current) {
      setState((prev) => ({ ...prev, syncStatus: "syncing" }));
    }

    try {
      const data = await callAgent({
        action: "get_state",
        assessment_id: ASSESSMENT_ID,
      });

      if (typeof data.subject_id === "string" && data.subject_id.length > 0) {
        localStorage.setItem(STORAGE_KEYS.subjectId, data.subject_id);
      }
      
      if (!mountedRef.current) return null;

      const serverState = (data.assessment_state as AssessmentState | null) || createEmptyState();

      setState({
        serverState,
        syncStatus: "synced",
        lastSyncAt: new Date(),
        error: null,
      });
      
      return serverState;
    } catch (error) {
      if (!mountedRef.current) return null;
      
      // On error, show error state (no localStorage fallback)
      const emptyState = createEmptyState();
      
      setState((prev) => ({
        serverState: emptyState,
        syncStatus: "error",
        lastSyncAt: prev.lastSyncAt,
        error: error instanceof Error ? error.message : "Unknown error",
      }));
      
      return emptyState;
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

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
  const isReportStale = assessmentState.report_stale;

  // Fetch report preview when assessment is complete and report is ready
  const fetchReportPreview = useCallback(async () => {
    if (!includeReportPreview) return;
    
    setIsLoadingReport(true);
    try {
      const data = await callAgent({
        action: "get_report",
        assessment_id: ASSESSMENT_ID,
      });

      if (mountedRef.current && data.report) {
        setReportPreview(data.report as ReadinessReport);
      }
    } catch (error) {
      console.error("Error fetching report preview:", error);
    } finally {
      if (mountedRef.current) {
        setIsLoadingReport(false);
      }
    }
  }, [includeReportPreview]);

  // Fetch report when assessment becomes complete and report is ready
  useEffect(() => {
    if (isComplete && isReportReady && includeReportPreview && !reportPreview && !isLoadingReport) {
      fetchReportPreview();
    }
  }, [isComplete, isReportReady, includeReportPreview, reportPreview, isLoadingReport, fetchReportPreview]);

  // Manual refresh
  const refresh = useCallback(() => {
    return fetchState(false);
  }, [fetchState]);

  // Start fresh - archive old assessments and create new one
  const startFresh = useCallback(async () => {
    setState((prev) => ({ ...prev, syncStatus: "syncing" }));

    try {
      const data = await callAgent({
        action: "start_fresh",
        assessment_id: ASSESSMENT_ID,
      });

      if (typeof data.subject_id === "string" && data.subject_id.length > 0) {
        localStorage.setItem(STORAGE_KEYS.subjectId, data.subject_id);
      }
      
      if (!mountedRef.current) return;

      // Clear report preview when starting fresh
      setReportPreview(null);

      const serverState = (data.assessment_state as AssessmentState | null) || createEmptyState();
      
      setState({
        serverState,
        syncStatus: "synced",
        lastSyncAt: new Date(),
        error: null,
      });

      return serverState;
    } catch (error) {
      if (!mountedRef.current) return;
      
      setState((prev) => ({
        ...prev,
        syncStatus: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      }));
      
      throw error;
    }
  }, []);

  // Clear local state (for logout/reset)
  const clearState = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.subjectId);
    // Also clear legacy keys
    localStorage.removeItem("rest-easy.readiness.report");
    localStorage.removeItem("rest-easy.readiness.report_stale");
    setReportPreview(null);
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
    
    // Report preview
    reportPreview,
    isLoadingReport,
    
    // Computed
    hasStarted,
    isComplete,
    isReportReady,
    isReportGenerating,
    isReportStale,
    
    // Actions
    refresh,
    startFresh,
    clearState,
    fetchReportPreview,
    
    // Utilities
    getTierFromScore,
  };
}

export type { AssessmentState, LocalAssessmentState, SyncStatus, ScoreTier };
