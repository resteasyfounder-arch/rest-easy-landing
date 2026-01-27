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
  
  // Profile Data
  profile_answers: Record<string, "yes" | "no">;
  profile_data: Record<string, unknown>;
  
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

// Schema-driven Roadmap Item - represents a question that can be improved
export interface RoadmapItem {
  question_id: string;
  section_id: string;
  section_label: string;
  question_text: string;
  current_answer: string;
  current_answer_label: string;
  score_fraction: number;
  improvement_potential: number;
  section_weight: number;
  priority: "HIGH" | "MEDIUM" | "LOW";
  improvement_options: Array<{
    value: string;
    label: string;
  }>;
}

// Completed item - question with perfect score
export interface CompletedItem {
  question_id: string;
  section_id: string;
  section_label: string;
  question_text: string;
  current_answer: string;
  current_answer_label: string;
}

// Response from get_improvement_items action
export interface ImprovementItemsResponse {
  items: RoadmapItem[];
  completed_items: CompletedItem[];
  total_applicable: number;
  total_answered: number;
}
