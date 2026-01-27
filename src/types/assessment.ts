// Assessment State Types - Server-authoritative state model

export type AssessmentStatus = "not_started" | "draft" | "in_progress" | "completed";
export type ReportStatus = "not_started" | "generating" | "ready" | "failed";
export type SectionStatus = "locked" | "available" | "in_progress" | "completed";
export type ScoreTier = "Getting Started" | "On Your Way" | "Well Prepared" | "Rest Easy Ready";

export interface SectionState {
  id: string;
  label: string;
  dimension: string;
  is_applicable: boolean;
  score: number;
  progress: number;
  questions_total: number;
  questions_answered: number;
  status: SectionStatus;
}

export interface AssessmentState {
  // Identity
  subject_id: string;
  assessment_id: string;
  
  // Overall Progress
  status: AssessmentStatus;
  overall_score: number;           // 0-100
  overall_progress: number;        // 0-100, % of applicable questions answered
  tier: ScoreTier;
  
  // Profile Progress
  profile_progress: number;        // 0-100
  profile_complete: boolean;
  
  // Section-level State
  sections: SectionState[];
  
  // Current Position
  current_section_id: string | null;
  current_question_id: string | null;
  next_question_id: string | null;
  
  // Report Status
  report_status: ReportStatus;
  report_url: string | null;
  report_stale: boolean;           // True when answers/profile changed after report generation
  
  // Timestamps
  last_activity_at: string;
  last_answer_at: string | null;
  updated_at: string;
}

export interface AssessmentStateResponse {
  subject_id: string;
  assessment_id: string;
  assessment_state: AssessmentState;
}

// Sync status for optimistic UI
export type SyncStatus = "synced" | "syncing" | "error" | "offline";

export interface LocalAssessmentState {
  serverState: AssessmentState | null;
  syncStatus: SyncStatus;
  lastSyncAt: Date | null;
  error: string | null;
}
