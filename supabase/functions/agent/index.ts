import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.1";

type AnswerValue = "yes" | "partial" | "no" | "not_sure" | "na";
type AssessmentStatus = "not_started" | "draft" | "in_progress" | "completed";
type ReportStatus = "not_started" | "generating" | "ready" | "failed";
type SectionStatus = "locked" | "available" | "in_progress" | "completed";
type ScoreTier = "Getting Started" | "On Your Way" | "Well Prepared" | "Rest Easy Ready";

interface SectionState {
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

type FlowPhase = "intro" | "profile" | "profile-review" | "assessment" | "section-summary" | "section-edit" | "review" | "complete";

interface AnswerRecord {
  question_id: string;
  item_id: string;
  section_id: string;
  dimension: string;
  answer_value: AnswerValue;
  answer_label?: string | null;
  score_fraction?: number | null;
  question_text?: string | null;
  question_meta?: Record<string, unknown>;
}

interface AssessmentState {
  subject_id: string;
  assessment_id: string;
  status: AssessmentStatus;
  overall_score: number;
  overall_progress: number;
  tier: ScoreTier;
  profile_progress: number;
  profile_complete: boolean;
  sections: SectionState[];
  current_section_id: string | null;
  current_question_id: string | null;
  next_question_id: string | null;
  report_status: ReportStatus;
  report_url: string | null;
  report_stale: boolean;
  last_activity_at: string;
  last_answer_at: string | null;
  updated_at: string;
  // Full hydration data for client
  profile_data: Record<string, unknown>;
  profile_answers: Record<string, "yes" | "no">;
  answers: Record<string, AnswerRecord>;
  flow_phase: FlowPhase;
}

type AgentAnswerInput = {
  question_id: string;
  item_id: string;
  section_id: string;
  dimension: string;
  answer_value: AnswerValue;
  answer_label?: string;
  score_fraction?: number;
  confidence?: number;
  question_text?: string;
  question_meta?: Record<string, unknown>;
};

type AgentRequest = {
  action?: "get_schema" | "get_state" | "start_fresh" | "save_report" | "get_report" | "get_improvement_items";
  subject_id?: string;
  user_id?: string;
  assessment_id?: string;
  schema_version?: string;
  profile?: {
    profile_json?: Record<string, unknown>;
    confidence_json?: Record<string, unknown>;
    version?: string;
  };
  answers?: AgentAnswerInput[];
  assessment?: {
    overall_score?: number;
    dimension_scores?: Record<string, number>;
    status?: "draft" | "completed";
    current_step?: number;
    current_section?: string;
  };
  message?: {
    text?: string;
  };
};

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Declare EdgeRuntime for background tasks
declare const EdgeRuntime: {
  waitUntil(promise: Promise<unknown>): void;
};

function getTierFromScore(score: number): ScoreTier {
  if (score >= 85) return "Rest Easy Ready";
  if (score >= 65) return "Well Prepared";
  if (score >= 40) return "On Your Way";
  return "Getting Started";
}

// ============================================================================
// BACKGROUND REPORT REGENERATION HELPER
// Triggers report regeneration as a background task after answer/profile updates
// ============================================================================
async function triggerReportRegeneration(
  readiness: ReturnType<ReturnType<typeof createClient>["schema"]>,
  assessmentDbId: string,
  subjectId: string,
  assessmentKey: string
): Promise<void> {
  console.log(`[agent] Starting background report regeneration for ${assessmentDbId}`);
  
  try {
    // Build report payload from current state
    const assessmentState = await computeAssessmentState(
      readiness, subjectId, assessmentDbId, assessmentKey
    );
    
    // Load schema for section labels/weights
    const { data: schemaData } = await readiness
      .from("assessment_schemas")
      .select("schema_json")
      .eq("assessment_id", assessmentKey)
      .eq("version", "v1")
      .single();
    
    const schema = schemaData?.schema_json as {
      answer_scoring?: Record<string, number | null>;
      score_bands?: unknown[];
      sections?: Array<{ id: string; weight: number }>;
    } | null;
    
    // Build section scores with labels
    const sectionScores: Record<string, { score: number; label: string; weight: number }> = {};
    for (const section of assessmentState.sections) {
      sectionScores[section.id] = {
        score: section.score,
        label: section.label,
        weight: schema?.sections?.find(s => s.id === section.id)?.weight || 1,
      };
    }
    
    // Build answers array
    const answersForReport = Object.values(assessmentState.answers).map(answer => ({
      question_id: answer.question_id,
      section_id: answer.section_id,
      question_text: answer.question_text || "",
      answer_value: answer.answer_value,
      answer_label: answer.answer_label || answer.answer_value,
      score_fraction: answer.score_fraction ?? null,
    }));
    
    // Call generate-report
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    console.log(`[agent] Calling generate-report edge function`);
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-report`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
      body: JSON.stringify({
        userName: "Friend",
        profile: assessmentState.profile_data,
        overallScore: assessmentState.overall_score,
        tier: assessmentState.tier,
        sectionScores,
        answers: answersForReport,
        schema: {
          answer_scoring: schema?.answer_scoring || {},
          score_bands: schema?.score_bands || [],
          sections: schema?.sections || [],
        },
      }),
    });
    
    const data = await response.json();
    
    if (response.ok && data.report) {
      // Save report and clear stale flag
      await readiness
        .from("assessments")
        .update({
          report_status: "ready",
          report_data: data.report,
          report_generated_at: new Date().toISOString(),
          report_stale: false,
        })
        .eq("id", assessmentDbId);
      console.log(`[agent] Background report regeneration complete for ${assessmentDbId}`);
    } else {
      // Mark as failed
      await readiness
        .from("assessments")
        .update({
          report_status: "failed",
        })
        .eq("id", assessmentDbId);
      console.error(`[agent] Background report regeneration failed:`, data.error || "Unknown error");
    }
  } catch (err) {
    console.error(`[agent] Background report regeneration error:`, err);
    // Mark as failed on exception
    await readiness
      .from("assessments")
      .update({
        report_status: "failed",
      })
      .eq("id", assessmentDbId);
  }
}

function evaluateCondition(
  expression: string | undefined,
  profile: Record<string, unknown>,
  answers: Record<string, AnswerValue>
): boolean {
  if (!expression || expression === "always") {
    return true;
  }

  const listPattern = /([^\s]+)\s+in\s+(\[[^\]]+\])/g;
  let jsExpression = expression.replace(/\band\b/g, "&&").replace(/\bor\b/g, "||");
  jsExpression = jsExpression.replace(listPattern, (_match, left, list) => {
    return `${list}.includes(${left})`;
  });

  try {
    const fn = new Function("profile", "answers", `return (${jsExpression});`);
    return Boolean(fn(profile, answers));
  } catch (_err) {
    return false;
  }
}

interface SchemaSection {
  id: string;
  label: string;
  dimension: string;
  weight: number;
}

interface SchemaQuestion {
  id: string;
  item_id: string;
  section_id: string;
  dimension: string;
  weight: number;
  prompt: string;
  type: string;
  options: Array<{ value: AnswerValue; label: string; score_value?: AnswerValue }>;
  applies_if?: string;
  system_na?: boolean;
}

interface ProfileQuestion {
  id: string;
  field: string;
  prompt: string;
  type: string;
  options: Array<{ value: string; label: string }>;
}

interface Schema {
  assessment_id: string;
  version: string;
  sections: SchemaSection[];
  answer_scoring: Record<AnswerValue, number | null>;
  profile_questions: ProfileQuestion[];
  questions: SchemaQuestion[];
}

// ============================================================================
// UNIFIED ASSESSMENT SELECTION HELPER
// With the unique constraint, there's exactly ONE non-archived assessment per subject.
// This helper is used by all actions to ensure consistent selection.
// ============================================================================
async function findActiveAssessment(
  readiness: ReturnType<ReturnType<typeof createClient>["schema"]>,
  subjectId: string,
  assessmentKey: string
): Promise<{
  id: string;
  status: string;
  overall_score: number;
  report_status: string;
  report_data: unknown;
  report_generated_at: string | null;
  report_stale: boolean;
  last_answer_at: string | null;
  created_at: string;
} | null> {
  // With the unique constraint, there's at most ONE non-archived assessment
  const { data, error } = await readiness
    .from("assessments")
    .select("id, status, overall_score, report_status, report_data, report_generated_at, report_stale, last_answer_at, created_at")
    .eq("subject_id", subjectId)
    .eq("assessment_id", assessmentKey)
    .neq("status", "archived")
    .maybeSingle();

  if (error) {
    console.error(`[findActiveAssessment] Error:`, error);
    return null;
  }

  return data;
}

async function computeAssessmentState(
  readiness: ReturnType<ReturnType<typeof createClient>["schema"]>,
  subjectId: string,
  assessmentDbId: string,
  assessmentKey: string
): Promise<AssessmentState> {
  // Load schema
  const { data: schemaData } = await readiness
    .from("assessment_schemas")
    .select("schema_json, version")
    .eq("assessment_id", assessmentKey)
    .eq("version", "v1")
    .maybeSingle();

  const schema = schemaData?.schema_json as Schema | null;

  // Load profile
  const { data: profileData } = await readiness
    .from("profile_intake")
    .select("profile_json")
    .eq("subject_id", subjectId)
    .maybeSingle();

  const profile = (profileData?.profile_json as Record<string, unknown>) || {};

  // Load answers with full details for hydration
  const { data: answersData } = await readiness
    .from("assessment_answers")
    .select("question_id, item_id, section_id, dimension, answer_value, answer_label, score_fraction, question_text, question_meta")
    .eq("assessment_id", assessmentDbId);

  const answers: Record<string, AnswerRecord> = {};
  const answerValues: Record<string, AnswerValue> = {};
  
  for (const row of answersData || []) {
    answers[row.question_id] = {
      question_id: row.question_id,
      item_id: row.item_id,
      section_id: row.section_id,
      dimension: row.dimension,
      answer_value: row.answer_value as AnswerValue,
      answer_label: row.answer_label,
      score_fraction: row.score_fraction,
      question_text: row.question_text,
      question_meta: row.question_meta as Record<string, unknown> | undefined,
    };
    answerValues[row.question_id] = row.answer_value as AnswerValue;
  }

  // Calculate profile_answers from profile data
  const profileAnswers: Record<string, "yes" | "no"> = {};
  if (schema) {
    for (const pq of schema.profile_questions) {
      let value: unknown = undefined;
      
      if (profile[pq.field] !== undefined) {
        value = profile[pq.field];
      }
      
      if (value === undefined) {
        const parts = pq.field.split(".");
        let current: unknown = profile;
        for (const part of parts) {
          if (current && typeof current === "object" && part in (current as Record<string, unknown>)) {
            current = (current as Record<string, unknown>)[part];
          } else {
            current = undefined;
            break;
          }
        }
        if (current !== undefined) {
          value = current;
        }
      }
      
      if (value !== undefined) {
        profileAnswers[pq.id] = value === true ? "yes" : "no";
      }
    }
  }

  // Load assessment status including stale flag
  const { data: assessmentData } = await readiness
    .from("assessments")
    .select("status, overall_score, updated_at, report_status, report_url, report_stale, last_answer_at")
    .eq("id", assessmentDbId)
    .maybeSingle();

  // Default state if no schema
  if (!schema) {
    return {
      subject_id: subjectId,
      assessment_id: assessmentDbId,
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
      report_stale: false,
      last_activity_at: new Date().toISOString(),
      last_answer_at: null,
      updated_at: new Date().toISOString(),
      profile_data: profile,
      profile_answers: {},
      answers: {},
      flow_phase: "intro",
    };
  }

  // Calculate profile progress
  const totalProfileQuestions = schema.profile_questions.length;
  const answeredProfileQuestions = schema.profile_questions.filter((q) => {
    if (profile[q.field] !== undefined) return true;
    
    for (const key of Object.keys(profile)) {
      if (key.endsWith(`.${q.field}`) || key === `profile.${q.field}`) {
        return true;
      }
    }
    
    const parts = q.field.split(".");
    let current: unknown = profile;
    for (const part of parts) {
      if (current && typeof current === "object" && part in (current as Record<string, unknown>)) {
        current = (current as Record<string, unknown>)[part];
      } else {
        return false;
      }
    }
    return current !== undefined;
  }).length;
  const profileProgress = totalProfileQuestions > 0
    ? Math.round((answeredProfileQuestions / totalProfileQuestions) * 100)
    : 100;
  const profileComplete = answeredProfileQuestions >= totalProfileQuestions;

  // Get applicable questions
  const applicableQuestions = schema.questions.filter((q) =>
    evaluateCondition(q.applies_if, profile, answerValues)
  );

  // Calculate section states
  const sections: SectionState[] = [];
  let totalApplicableQuestions = 0;
  let totalAnsweredQuestions = 0;
  let weightedScoreSum = 0;
  let totalWeight = 0;

  for (const section of schema.sections) {
    const sectionQuestions = applicableQuestions.filter(
      (q) => q.section_id === section.id
    );
    
    if (sectionQuestions.length === 0) {
      sections.push({
        id: section.id,
        label: section.label,
        dimension: section.dimension,
        is_applicable: false,
        score: 0,
        progress: 0,
        questions_total: 0,
        questions_answered: 0,
        status: "locked",
      });
      continue;
    }

    const answeredInSection = sectionQuestions.filter((q) => answers[q.id]);
    const answeredCount = answeredInSection.length;
    const totalCount = sectionQuestions.length;
    const progress = Math.round((answeredCount / totalCount) * 100);

    let sectionScore = 0;
    let scoredCount = 0;
    
    for (const q of answeredInSection) {
      const answer = answers[q.id];
      if (answer && answer.score_fraction !== null && answer.score_fraction !== undefined) {
        sectionScore += answer.score_fraction * 100;
        scoredCount++;
      }
    }
    
    const avgSectionScore = scoredCount > 0 ? Math.round(sectionScore / scoredCount) : 0;

    let status: SectionStatus = "available";
    if (answeredCount === totalCount) {
      status = "completed";
    } else if (answeredCount > 0) {
      status = "in_progress";
    }

    sections.push({
      id: section.id,
      label: section.label,
      dimension: section.dimension,
      is_applicable: true,
      score: avgSectionScore,
      progress,
      questions_total: totalCount,
      questions_answered: answeredCount,
      status,
    });

    totalApplicableQuestions += totalCount;
    totalAnsweredQuestions += answeredCount;
    
    if (scoredCount > 0) {
      weightedScoreSum += avgSectionScore * section.weight;
      totalWeight += section.weight;
    }
  }

  const overallProgress = totalApplicableQuestions > 0
    ? Math.round((totalAnsweredQuestions / totalApplicableQuestions) * 100)
    : 0;
  
  const overallScore = totalWeight > 0
    ? Math.round(weightedScoreSum / totalWeight)
    : 0;

  const tier = getTierFromScore(overallScore);

  let currentSectionId: string | null = null;
  let currentQuestionId: string | null = null;
  let nextQuestionId: string | null = null;

  for (const q of applicableQuestions) {
    if (!answers[q.id]) {
      if (!currentQuestionId) {
        currentQuestionId = q.id;
        currentSectionId = q.section_id;
      } else if (!nextQuestionId) {
        nextQuestionId = q.id;
        break;
      }
    }
  }

  let status: AssessmentStatus = "not_started";
  if (totalAnsweredQuestions > 0) {
    if (totalAnsweredQuestions >= totalApplicableQuestions) {
      status = "completed";
    } else {
      status = "in_progress";
    }
  } else if (assessmentData?.status === "draft") {
    status = "draft";
  }

  let flowPhase: FlowPhase = "intro";
  if (status === "completed") {
    flowPhase = "complete";
  } else if (totalAnsweredQuestions > 0) {
    flowPhase = "assessment";
  } else if (profileComplete) {
    flowPhase = "assessment";
  } else if (Object.keys(profileAnswers).length > 0) {
    flowPhase = "profile";
  }

  return {
    subject_id: subjectId,
    assessment_id: assessmentDbId,
    status,
    overall_score: overallScore,
    overall_progress: overallProgress,
    tier,
    profile_progress: profileProgress,
    profile_complete: profileComplete,
    sections,
    current_section_id: currentSectionId,
    current_question_id: currentQuestionId,
    next_question_id: nextQuestionId,
    report_status: (assessmentData?.report_status as ReportStatus) || "not_started",
    report_url: assessmentData?.report_url || null,
    report_stale: assessmentData?.report_stale || false,
    last_activity_at: assessmentData?.updated_at || new Date().toISOString(),
    last_answer_at: assessmentData?.last_answer_at || null,
    updated_at: new Date().toISOString(),
    profile_data: profile,
    profile_answers: profileAnswers,
    answers,
    flow_phase: flowPhase,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ error: "Missing Supabase environment configuration" }, 500);
  }

  let payload: AgentRequest;
  try {
    payload = await req.json();
  } catch (_err) {
    return jsonResponse({ error: "Invalid JSON payload" }, 400);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
  const readiness = supabase.schema("readiness_v1");
  const assessmentKey = payload.assessment_id ?? "readiness_v1";

  // Handle get_improvement_items action - returns improvable questions for the roadmap
  if (payload.action === "get_improvement_items") {
    if (!payload.subject_id) {
      return jsonResponse({ error: "subject_id required for get_improvement_items" }, 400);
    }

    console.log(`[get_improvement_items] Fetching for subject ${payload.subject_id}`);

    // Find active assessment
    const assessment = await findActiveAssessment(readiness, payload.subject_id, assessmentKey);
    if (!assessment) {
      return jsonResponse({ items: [], completed_items: [] });
    }

    // Load schema
    const { data: schemaData } = await readiness
      .from("assessment_schemas")
      .select("schema_json")
      .eq("assessment_id", assessmentKey)
      .eq("version", "v1")
      .maybeSingle();

    const schema = schemaData?.schema_json as Schema | null;
    if (!schema) {
      return jsonResponse({ error: "Schema not found" }, 404);
    }

    // Load profile for applies_if conditions
    const { data: profileData } = await readiness
      .from("profile_intake")
      .select("profile_json")
      .eq("subject_id", payload.subject_id)
      .maybeSingle();
    const profile = (profileData?.profile_json as Record<string, unknown>) || {};

    // Load all answers
    const { data: answersData } = await readiness
      .from("assessment_answers")
      .select("question_id, item_id, section_id, dimension, answer_value, answer_label, score_fraction, question_text")
      .eq("assessment_id", assessment.id);

    interface AnswerRow {
      question_id: string;
      item_id: string;
      section_id: string;
      dimension: string;
      answer_value: string;
      answer_label: string | null;
      score_fraction: number | null;
      question_text: string | null;
    }

    const answerMap = new Map<string, AnswerRow>();
    const answerValues: Record<string, AnswerValue> = {};
    for (const row of (answersData || []) as AnswerRow[]) {
      answerMap.set(row.question_id, row);
      answerValues[row.question_id] = row.answer_value as AnswerValue;
    }

    // Get applicable questions
    const applicableQuestions = schema.questions.filter((q: SchemaQuestion) =>
      evaluateCondition(q.applies_if, profile, answerValues)
    );

    // Build section weight map
    const sectionWeightMap = new Map<string, number>();
    for (const section of schema.sections) {
      sectionWeightMap.set(section.id, section.weight);
    }

    // Build section label map
    const sectionLabelMap = new Map<string, string>();
    for (const section of schema.sections) {
      sectionLabelMap.set(section.id, section.label);
    }

    // Helper to calculate priority
    const calculatePriority = (scoreFraction: number, sectionWeight: number): "HIGH" | "MEDIUM" | "LOW" => {
      // High priority: High-weight sections with low scores
      if (sectionWeight >= 15 && scoreFraction < 0.5) return "HIGH";
      // Medium: Either high-weight with partial, or medium-weight with no
      if (sectionWeight >= 10 || scoreFraction === 0) return "MEDIUM";
      return "LOW";
    };

    // Build improvement items (score_fraction < 1.0)
    const improvementItems: Array<{
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
      improvement_options: Array<{ value: string; label: string }>;
    }> = [];

    // Build completed items (score_fraction = 1.0)
    const completedItems: Array<{
      question_id: string;
      section_id: string;
      section_label: string;
      question_text: string;
      current_answer: string;
      current_answer_label: string;
    }> = [];

    for (const question of applicableQuestions) {
      const answer = answerMap.get(question.id);
      if (!answer) continue; // Skip unanswered questions

      const scoreFraction = answer.score_fraction ?? 0;
      const sectionWeight = sectionWeightMap.get(question.section_id) || 1;
      const sectionLabel = sectionLabelMap.get(question.section_id) || question.section_id;

      if (scoreFraction >= 1.0) {
        // Completed item
        completedItems.push({
          question_id: question.id,
          section_id: question.section_id,
          section_label: sectionLabel,
          question_text: answer.question_text || question.prompt,
          current_answer: answer.answer_value,
          current_answer_label: answer.answer_label || answer.answer_value,
        });
      } else {
        // Find options that would improve the score
        const currentScore = scoreFraction;
        const betterOptions = question.options
          .filter((opt: { value: AnswerValue; label: string }) => {
            const optScore = schema.answer_scoring[opt.value];
            return optScore !== null && optScore !== undefined && optScore > currentScore;
          })
          .map((opt: { value: AnswerValue; label: string }) => ({
            value: opt.value,
            label: opt.label,
          }));

        improvementItems.push({
          question_id: question.id,
          section_id: question.section_id,
          section_label: sectionLabel,
          question_text: answer.question_text || question.prompt,
          current_answer: answer.answer_value,
          current_answer_label: answer.answer_label || answer.answer_value,
          score_fraction: scoreFraction,
          improvement_potential: 1.0 - scoreFraction,
          section_weight: sectionWeight,
          priority: calculatePriority(scoreFraction, sectionWeight),
          improvement_options: betterOptions,
        });
      }
    }

    // Sort by priority (HIGH first), then by improvement potential
    const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    improvementItems.sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.improvement_potential - a.improvement_potential;
    });

    console.log(`[get_improvement_items] Found ${improvementItems.length} items to improve, ${completedItems.length} completed`);

    return jsonResponse({
      items: improvementItems,
      completed_items: completedItems,
      total_applicable: applicableQuestions.length,
      total_answered: answerMap.size,
    });
  }

  // Handle get_schema action
  if (payload.action === "get_schema") {
    const schemaVersion = payload.schema_version ?? "v1";
    const { data, error } = await readiness
      .from("assessment_schemas")
      .select("schema_json, version")
      .eq("assessment_id", assessmentKey)
      .eq("version", schemaVersion)
      .maybeSingle();

    if (error) {
      return jsonResponse({ error: "Failed to load schema" }, 500);
    }
    if (!data?.schema_json) {
      return jsonResponse({ error: "Schema not found" }, 404);
    }

    return jsonResponse({
      assessment_id: assessmentKey,
      version: data.version,
      schema: data.schema_json,
    });
  }

  // Handle save_report action - store report data and update status
  if (payload.action === "save_report") {
    const { assessment_id: assessmentDbId, report_data } = payload as AgentRequest & { report_data?: unknown };
    
    if (!assessmentDbId) {
      return jsonResponse({ error: "assessment_id required for save_report" }, 400);
    }
    if (!report_data) {
      return jsonResponse({ error: "report_data required for save_report" }, 400);
    }

    console.log(`[save_report] Saving report for assessment ${assessmentDbId}`);

    const { error: updateError } = await readiness
      .from("assessments")
      .update({
        report_status: "ready",
        report_data: report_data,
        report_generated_at: new Date().toISOString(),
        report_stale: false,
      })
      .eq("id", assessmentDbId);

    if (updateError) {
      console.error(`[save_report] Error:`, updateError);
      return jsonResponse({ error: "Failed to save report" }, 500);
    }

    console.log(`[save_report] Report saved successfully`);
    return jsonResponse({ success: true });
  }

  // Handle get_report action - use unified findActiveAssessment
  if (payload.action === "get_report") {
    if (!payload.subject_id) {
      return jsonResponse({ error: "subject_id required for get_report" }, 400);
    }

    console.log(`[get_report] Fetching report for subject ${payload.subject_id}`);

    // Use the unified helper - guaranteed to get the same assessment as get_state
    const assessment = await findActiveAssessment(readiness, payload.subject_id, assessmentKey);

    if (!assessment) {
      console.log(`[get_report] No active assessment found`);
      return jsonResponse({ 
        report: null, 
        status: "not_started" 
      });
    }

    console.log(`[get_report] Using assessment ${assessment.id}, report_status: ${assessment.report_status}`);

    if (!assessment.report_data) {
      console.log(`[get_report] No report data in assessment`);
      return jsonResponse({ 
        report: null, 
        status: assessment.report_status || "not_started" 
      });
    }

    console.log(`[get_report] Report found, status: ${assessment.report_status}`);
    return jsonResponse({
      report: assessment.report_data,
      status: assessment.report_status,
      generated_at: assessment.report_generated_at,
    });
  }

  // Handle get_state action - use unified findActiveAssessment
  if (payload.action === "get_state") {
    // If no subject_id provided, return empty state for new user
    if (!payload.subject_id) {
      console.log(`[get_state] No subject_id provided - returning empty state for new user`);
      return jsonResponse({
        subject_id: null,
        assessment_id: null,
        assessment_state: {
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
          report_stale: false,
          last_activity_at: new Date().toISOString(),
          last_answer_at: null,
          updated_at: new Date().toISOString(),
          profile_data: {},
          profile_answers: {},
          answers: {},
          flow_phase: "intro",
        },
      });
    }

    // Use the unified helper
    const assessment = await findActiveAssessment(readiness, payload.subject_id, assessmentKey);

    if (!assessment) {
      console.log(`[get_state] No active assessment for subject ${payload.subject_id}`);
      return jsonResponse({
        subject_id: payload.subject_id,
        assessment_id: null,
        assessment_state: {
          subject_id: payload.subject_id,
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
          report_stale: false,
          last_activity_at: new Date().toISOString(),
          last_answer_at: null,
          updated_at: new Date().toISOString(),
          profile_data: {},
          profile_answers: {},
          answers: {},
          flow_phase: "intro",
        },
      });
    }

    console.log(`[get_state] Using assessment ${assessment.id}`);

    const assessmentState = await computeAssessmentState(
      readiness,
      payload.subject_id,
      assessment.id,
      assessmentKey
    );

    return jsonResponse({
      subject_id: payload.subject_id,
      assessment_id: assessment.id,
      assessment_state: assessmentState,
    });
  }

  // Handle start_fresh action - archive old assessment and create new one
  if (payload.action === "start_fresh") {
    if (!payload.subject_id) {
      return jsonResponse({ error: "subject_id required for start_fresh" }, 400);
    }

    console.log(`[start_fresh] Archiving assessment for subject ${payload.subject_id}`);

    // Archive the current active assessment (unique constraint ensures only one)
    const { error: archiveError } = await readiness
      .from("assessments")
      .update({ status: "archived" })
      .eq("subject_id", payload.subject_id)
      .eq("assessment_id", assessmentKey)
      .neq("status", "archived");

    if (archiveError) {
      console.error(`[start_fresh] Archive error:`, archiveError);
      return jsonResponse({ error: "Failed to archive old assessment" }, 500);
    }

    // Create a new blank assessment
    const { data: newAssessment, error: createError } = await readiness
      .from("assessments")
      .insert({
        subject_id: payload.subject_id,
        assessment_id: assessmentKey,
        schema_version: "v1",
        status: "draft",
        overall_score: 0,
        report_status: "not_started",
      })
      .select("id")
      .single();

    if (createError || !newAssessment) {
      console.error(`[start_fresh] Create error:`, createError);
      return jsonResponse({ error: "Failed to create new assessment" }, 500);
    }

    console.log(`[start_fresh] Created new assessment ${newAssessment.id}`);

    const assessmentState = await computeAssessmentState(
      readiness,
      payload.subject_id,
      newAssessment.id,
      assessmentKey
    );

    return jsonResponse({
      subject_id: payload.subject_id,
      assessment_id: newAssessment.id,
      assessment_state: assessmentState,
      message: "Started fresh assessment. Previous data has been archived.",
    });
  }

  // Default behavior - upsert flow
  const subjectResult = await ensureSubject(readiness, payload);
  if (!subjectResult.id) {
    return jsonResponse(
      { error: "Unable to resolve subject", detail: subjectResult.error ?? "unknown" },
      500
    );
  }

  const assessmentResult = await ensureAssessment(
    readiness,
    subjectResult.id,
    payload.assessment_id
  );
  if (!assessmentResult.id) {
    return jsonResponse(
      { error: "Unable to resolve assessment", detail: assessmentResult.error ?? "unknown" },
      500
    );
  }

  if (payload.profile) {
    const profileRow = {
      subject_id: subjectResult.id,
      profile_json: payload.profile.profile_json ?? {},
      confidence_json: payload.profile.confidence_json ?? {},
      version: payload.profile.version ?? "v1",
    };

    const { error: profileError } = await readiness
      .from("profile_intake")
      .upsert(profileRow, { onConflict: "subject_id" });

    if (profileError) {
      return jsonResponse({ error: "Failed to save profile" }, 500);
    }

    // Check if report exists and needs regeneration
    const { data: currentAssessmentForProfile } = await readiness
      .from("assessments")
      .select("report_status, report_data")
      .eq("id", assessmentResult.id)
      .maybeSingle();

    // Trigger background regeneration if a report has been generated before
    if (currentAssessmentForProfile?.report_data && currentAssessmentForProfile?.report_status === "ready") {
      console.log(`[agent] Profile updated, triggering background report regeneration`);
      
      // Set status to generating synchronously before background task
      await readiness
        .from("assessments")
        .update({
          report_status: "generating",
          report_stale: true,
        })
        .eq("id", assessmentResult.id);
      
      // Use EdgeRuntime.waitUntil for background execution
      EdgeRuntime.waitUntil(
        triggerReportRegeneration(
          readiness,
          assessmentResult.id,
          subjectResult.id,
          assessmentKey
        )
      );
    }
  }

  if (payload.answers && payload.answers.length > 0) {
    const answerRows = payload.answers.map((answer) => ({
      assessment_id: assessmentResult.id,
      subject_id: subjectResult.id,
      question_id: answer.question_id,
      item_id: answer.item_id,
      section_id: answer.section_id,
      dimension: answer.dimension,
      answer_value: answer.answer_value,
      answer_label: answer.answer_label ?? null,
      score_fraction: answer.score_fraction ?? null,
      confidence: answer.confidence ?? null,
      question_text: answer.question_text ?? null,
      question_meta: answer.question_meta ?? {},
    }));

    const { error: answersError } = await readiness
      .from("assessment_answers")
      .upsert(answerRows, { onConflict: "assessment_id,question_id" });

    if (answersError) {
      return jsonResponse({ error: "Failed to save answers" }, 500);
    }

    // Update last_answer_at
    await readiness
      .from("assessments")
      .update({
        last_answer_at: new Date().toISOString(),
      })
      .eq("id", assessmentResult.id);

    // Check if report exists and needs regeneration OR if assessment just became complete
    const { data: currentAssessmentForAnswer } = await readiness
      .from("assessments")
      .select("report_status, report_data")
      .eq("id", assessmentResult.id)
      .maybeSingle();

    // Check if this answer completes the assessment (for first-time report generation)
    const assessmentStateAfterAnswer = await computeAssessmentState(
      readiness,
      subjectResult.id,
      assessmentResult.id,
      assessmentKey
    );
    const isNowComplete = assessmentStateAfterAnswer.status === "completed";
    const hasExistingReport = !!currentAssessmentForAnswer?.report_data;
    const isAlreadyGenerating = currentAssessmentForAnswer?.report_status === "generating";

    if (hasExistingReport && currentAssessmentForAnswer?.report_status === "ready") {
      // Report exists and is ready - trigger background regeneration because answer changed
      console.log(`[agent] Answer updated, triggering background report regeneration`);
      
      // Set status to generating synchronously before background task
      await readiness
        .from("assessments")
        .update({
          report_status: "generating",
          report_stale: true,
        })
        .eq("id", assessmentResult.id);
      
      // Use EdgeRuntime.waitUntil for background execution
      EdgeRuntime.waitUntil(
        triggerReportRegeneration(
          readiness,
          assessmentResult.id,
          subjectResult.id,
          assessmentKey
        )
      );
    } else if (isNowComplete && !hasExistingReport && !isAlreadyGenerating) {
      // Assessment just became complete for the first time - trigger initial report generation
      console.log(`[agent] Assessment completed for first time, triggering initial report generation`);
      
      // Set status to generating synchronously before background task
      await readiness
        .from("assessments")
        .update({
          report_status: "generating",
          report_stale: false,
        })
        .eq("id", assessmentResult.id);
      
      // Use EdgeRuntime.waitUntil for background execution
      EdgeRuntime.waitUntil(
        triggerReportRegeneration(
          readiness,
          assessmentResult.id,
          subjectResult.id,
          assessmentKey
        )
      );
    }
  }

  if (payload.assessment) {
    const updates: Record<string, unknown> = {};
    if (payload.assessment.overall_score !== undefined) {
      updates.overall_score = payload.assessment.overall_score;
    }
    if (payload.assessment.dimension_scores) {
      updates.dimension_scores = payload.assessment.dimension_scores;
    }
    if (payload.assessment.status) {
      updates.status = payload.assessment.status;
    }
    if (payload.assessment.current_step !== undefined) {
      updates.current_step = payload.assessment.current_step;
    }
    if (payload.assessment.current_section) {
      updates.current_section = payload.assessment.current_section;
    }

    if (Object.keys(updates).length > 0) {
      const { error: assessmentError } = await readiness
        .from("assessments")
        .update(updates)
        .eq("id", assessmentResult.id);

      if (assessmentError) {
        return jsonResponse({ error: "Failed to update assessment" }, 500);
      }
    }
  }

  // Compute and return updated assessment state
  const assessmentState = await computeAssessmentState(
    readiness,
    subjectResult.id,
    assessmentResult.id,
    assessmentKey
  );

  return jsonResponse({
    subject_id: subjectResult.id,
    assessment_id: assessmentResult.id,
    assessment_state: assessmentState,
    assistant_message: "Thanks. Your readiness progress is saved.",
    next_questions: [],
    suggested_actions: [],
    risk_flags: [],
  });
});

async function ensureSubject(
  readiness: ReturnType<ReturnType<typeof createClient>["schema"]>,
  payload: AgentRequest
): Promise<{ id?: string; error?: string }> {
  if (payload.subject_id) {
    const { data: existing, error } = await readiness
      .from("subjects")
      .select("id")
      .eq("id", payload.subject_id)
      .maybeSingle();

    if (error) {
      return { error: error.message };
    }

    if (existing?.id) {
      return { id: existing.id };
    }
  }

  if (payload.user_id) {
    const { data: upserted, error } = await readiness
      .from("subjects")
      .upsert({ kind: "user", user_id: payload.user_id }, { onConflict: "user_id" })
      .select("id")
      .single();

    if (error) {
      return { error: error.message };
    }

    return { id: upserted.id };
  }

  const { data: created, error: createError } = await readiness
    .from("subjects")
    .insert({ kind: "guest" })
    .select("id")
    .single();

  if (createError) {
    return { error: createError.message };
  }

  return { id: created.id };
}

// ============================================================================
// REFACTORED: ensureAssessment now finds ANY non-archived assessment
// With the unique constraint, there's at most ONE active assessment per subject.
// ============================================================================
async function ensureAssessment(
  readiness: ReturnType<ReturnType<typeof createClient>["schema"]>,
  subjectId: string,
  assessmentId?: string
): Promise<{ id?: string; error?: string }> {
  const assessmentKey = assessmentId ?? "readiness_v1";

  // Find ANY existing non-archived assessment (not just 'draft')
  const { data: existing, error: fetchError } = await readiness
    .from("assessments")
    .select("id")
    .eq("subject_id", subjectId)
    .eq("assessment_id", assessmentKey)
    .neq("status", "archived")
    .maybeSingle();

  if (fetchError) {
    console.error(`[ensureAssessment] Fetch error:`, fetchError);
    return { error: fetchError.message };
  }

  if (existing?.id) {
    console.log(`[ensureAssessment] Found existing assessment ${existing.id}`);
    return { id: existing.id };
  }

  // Create new only if none exists
  console.log(`[ensureAssessment] Creating new assessment for subject ${subjectId}`);
  const { data: created, error } = await readiness
    .from("assessments")
    .insert({
      subject_id: subjectId,
      assessment_id: assessmentKey,
      schema_version: "v1",
      status: "draft",
    })
    .select("id")
    .single();

  if (error) {
    console.error(`[ensureAssessment] Create error:`, error);
    return { error: error.message };
  }

  console.log(`[ensureAssessment] Created new assessment ${created.id}`);
  return { id: created.id };
}
