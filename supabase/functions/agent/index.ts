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
  last_activity_at: string;
  updated_at: string;
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
  action?: "get_schema" | "get_state";
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

function getTierFromScore(score: number): ScoreTier {
  if (score >= 85) return "Rest Easy Ready";
  if (score >= 65) return "Well Prepared";
  if (score >= 40) return "On Your Way";
  return "Getting Started";
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

interface AnswerRecord {
  question_id: string;
  answer_value: AnswerValue;
  score_fraction: number | null;
  section_id: string;
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

  // Load answers
  const { data: answersData } = await readiness
    .from("assessment_answers")
    .select("question_id, answer_value, score_fraction, section_id")
    .eq("assessment_id", assessmentDbId);

  const answers: Record<string, AnswerRecord> = {};
  const answerValues: Record<string, AnswerValue> = {};
  
  for (const row of answersData || []) {
    answers[row.question_id] = row as AnswerRecord;
    answerValues[row.question_id] = row.answer_value as AnswerValue;
  }

  // Load assessment status
  const { data: assessmentData } = await readiness
    .from("assessments")
    .select("status, overall_score, updated_at, report_status, report_url")
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
      last_activity_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  // Calculate profile progress
  const totalProfileQuestions = schema.profile_questions.length;
  const answeredProfileQuestions = schema.profile_questions.filter(
    (q) => profile[q.field] !== undefined
  ).length;
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
      // Section not applicable
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

    // Calculate section score
    let sectionScore = 0;
    let scoredCount = 0;
    
    for (const q of answeredInSection) {
      const answer = answers[q.id];
      if (answer && answer.score_fraction !== null) {
        sectionScore += answer.score_fraction * 100;
        scoredCount++;
      }
    }
    
    const avgSectionScore = scoredCount > 0 ? Math.round(sectionScore / scoredCount) : 0;

    // Determine section status
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

    // Accumulate for overall score
    totalApplicableQuestions += totalCount;
    totalAnsweredQuestions += answeredCount;
    
    if (scoredCount > 0) {
      weightedScoreSum += avgSectionScore * section.weight;
      totalWeight += section.weight;
    }
  }

  // Calculate overall progress and score
  const overallProgress = totalApplicableQuestions > 0
    ? Math.round((totalAnsweredQuestions / totalApplicableQuestions) * 100)
    : 0;
  
  const overallScore = totalWeight > 0
    ? Math.round(weightedScoreSum / totalWeight)
    : 0;

  const tier = getTierFromScore(overallScore);

  // Determine current position
  let currentSectionId: string | null = null;
  let currentQuestionId: string | null = null;
  let nextQuestionId: string | null = null;

  // Find first unanswered question
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

  // Determine assessment status
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
    last_activity_at: assessmentData?.updated_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
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

  // Handle get_state action
  if (payload.action === "get_state") {
    if (!payload.subject_id) {
      return jsonResponse({ error: "subject_id required for get_state" }, 400);
    }

    // Find the assessment
    const { data: assessment } = await readiness
      .from("assessments")
      .select("id")
      .eq("subject_id", payload.subject_id)
      .eq("assessment_id", assessmentKey)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!assessment) {
      // No assessment exists - return empty state
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
          last_activity_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      });
    }

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

async function ensureAssessment(
  readiness: ReturnType<ReturnType<typeof createClient>["schema"]>,
  subjectId: string,
  assessmentId?: string
): Promise<{ id?: string; error?: string }> {
  const assessmentKey = assessmentId ?? "readiness_v1";

  const { data: existing } = await readiness
    .from("assessments")
    .select("id")
    .eq("subject_id", subjectId)
    .eq("assessment_id", assessmentKey)
    .eq("status", "draft")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing?.id) {
    return { id: existing.id };
  }

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
    return { error: error.message };
  }

  return { id: created.id };
}
