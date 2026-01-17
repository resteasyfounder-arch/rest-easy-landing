// Life Readiness Report Types - Comprehensive Format

export type ReportTier = "Getting Started" | "On Your Way" | "Well Prepared" | "Rest Easy Ready";

export interface ReportMetrics {
  categoriesAssessed: number;
  strengthsIdentified: number;
  areasToAddress: number;
  actionItems: number;
}

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
  week_1_2: TimelineItem[];
  month_1_2: TimelineItem[];
  month_3_6: TimelineItem[];
}

export interface TimelineItem {
  title: string;
  description: string;
}

export interface JourneyReflection {
  summary: string;
  strongest_area: {
    category: string;
    score: number;
    insight: string;
  };
  growth_areas: {
    category: string;
    score: number;
    insight: string;
  }[];
  response_highlights: {
    question_context: string;
    implication: string;
  }[];
}

export interface ReadinessReport {
  // Header / Cover Page
  tier: ReportTier;
  overallScore: number;
  generatedAt: string;
  userName: string;
  metrics: ReportMetrics;
  
  // Executive Summary (comprehensive, 2-3 substantial paragraphs)
  executive_summary: string;
  
  // Top 3 Recommended Immediate Actions
  immediate_actions: ImmediateAction[];
  
  // Category Analysis - One per section (Assessment Results by Category)
  category_analyses: CategoryAnalysis[];
  
  // Areas of Strength (4-6 items with full descriptions)
  strengths: Strength[];
  
  // Areas Requiring Attention (4-6 items with priority labels)
  areas_requiring_attention: AttentionArea[];
  
  // Personalized Action Plan (6-8 detailed items)
  action_plan: ActionItem[];
  
  // Understanding Your Planning Journey (narrative reflection)
  journey_reflection: JourneyReflection;
  
  // Practical Timeline with detailed descriptions
  timeline: ReportTimeline;
  
  // Reflecting on Your Responses (specific response analysis)
  response_reflection: string;
  
  // Moving Forward: Personalized Guide
  moving_forward: string;
  
  // Closing Letter (warm, personalized 2-3 paragraphs)
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
