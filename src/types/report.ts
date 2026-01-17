// Life Readiness Report Types

export type ReportTier = "Getting Started" | "On Your Way" | "Well Prepared" | "Rest Easy Ready";

export interface ImmediateAction {
  title: string;
  description: string;
  priority: number;
}

export interface CategoryAnalysis {
  section_id: string;
  section_label: string;
  score: number;
  analysis: string;
}

export interface Strength {
  title: string;
  description: string;
}

export interface AttentionArea {
  title: string;
  description: string;
  priority: "PRIORITY" | "IMPORTANT";
}

export interface ActionItem {
  title: string;
  description: string;
  why_it_matters: string;
  effort: "Less than 1 hour" | "A few hours" | "May require professional assistance";
  timeline: "Complete this week" | "Complete this month" | "Complete within 3 months";
  priority: "HIGH" | "MEDIUM" | "LOW";
}

export interface ReportTimeline {
  week_1_2: string[];
  month_1_2: string[];
  month_3_6: string[];
}

export interface ReadinessReport {
  // Header
  tier: ReportTier;
  overallScore: number;
  generatedAt: string;
  userName: string;
  
  // Executive Summary
  executive_summary: string;
  
  // Quick Wins - Top 3 Immediate Actions
  immediate_actions: ImmediateAction[];
  
  // Category Analysis - One per section
  category_analyses: CategoryAnalysis[];
  
  // Strengths (4-6 items)
  strengths: Strength[];
  
  // Areas Requiring Attention (4-6 items)
  areas_requiring_attention: AttentionArea[];
  
  // Personalized Action Plan (6-8 items)
  action_plan: ActionItem[];
  
  // Suggested Timeline
  timeline: ReportTimeline;
  
  // Closing Letter
  closing_message: string;
}

// Input types for report generation
export interface ReportGenerationInput {
  userName: string;
  profile: Record<string, unknown>;
  overallScore: number;
  tier: string;
  sectionScores: Record<string, { score: number; label: string; weight: number }>;
  answers: Array<{
    question_id: string;
    section_id: string;
    question_text: string;
    answer_value: string;
    answer_label: string;
    score_fraction: number | null;
  }>;
  schema: {
    answer_scoring: Record<string, number | null>;
    score_bands: Array<{ min: number; max: number; label: string }>;
    sections: Array<{ id: string; label: string; weight: number }>;
  };
}
