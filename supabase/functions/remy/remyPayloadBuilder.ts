import {
  buildPriorityScore,
  buildReassurance,
  evaluateCondition,
  getPriority,
} from "./decisionEngine.ts";
import type { AnswerValue, Priority } from "./decisionEngine.ts";

export type RemySurface = "dashboard" | "readiness" | "section_summary" | "results" | "profile" | "menu" | "vault";

export type SchemaSection = {
  id: string;
  label: string;
  dimension: string;
  weight: number;
};

export type SchemaQuestion = {
  id: string;
  section_id: string;
  prompt: string;
  options: Array<{ value: AnswerValue; label: string }>;
  applies_if?: string;
};

export type Schema = {
  sections: SchemaSection[];
  questions: SchemaQuestion[];
  answer_scoring: Record<AnswerValue, number | null>;
};

export type AnswerRow = {
  question_id: string;
  section_id: string;
  answer_value: AnswerValue;
  answer_label: string | null;
  score_fraction: number | null;
  question_text: string | null;
};

export type AssessmentRow = {
  id: string;
  status: string;
  report_status: string;
  report_stale: boolean;
  report_data: unknown;
  last_answer_at: string | null;
  overall_score?: number | null;
};

type ImprovementItem = {
  question_id: string;
  section_id: string;
  section_label: string;
  question_text: string;
  current_answer: string;
  current_answer_label: string;
  score_fraction: number;
  section_weight: number;
  priority: Priority;
  priority_score: number;
};

type RemyNudge = {
  id: string;
  title: string;
  body: string;
  cta?: {
    label: string;
    href: string;
  };
};

type RemyExplanation = {
  id: string;
  title: string;
  body: string;
  source_refs: string[];
};

type RemyPriorityItem = {
  id: string;
  title: string;
  priority: Priority;
  why_now: string;
  target_href: string;
};

type RemyReassurance = {
  title: string;
  body: string;
};

function resolveReturnTo(surface: RemySurface): string {
  if (surface === "profile") return "profile";
  if (surface === "menu") return "menu";
  if (surface === "vault") return "vault";
  if (surface === "results") return "results";
  if (surface === "readiness") return "readiness";
  return "dashboard";
}

export type RemySurfacePayload = {
  surface: RemySurface;
  generated_at: string;
  domain_scope: "rest_easy_readiness";
  nudge: RemyNudge | null;
  explanations: RemyExplanation[];
  priorities: RemyPriorityItem[];
  reassurance: RemyReassurance;
};

export function emptySurfacePayload(surface: RemySurface): RemySurfacePayload {
  return {
    surface,
    generated_at: new Date().toISOString(),
    domain_scope: "rest_easy_readiness",
    nudge: null,
    explanations: [],
    priorities: [],
    reassurance: {
      title: "No active guidance yet",
      body: "Start your readiness flow and Remy will prioritize your next steps.",
    },
  };
}

function isDismissed(dismissed: Record<string, string>, nudgeId: string): boolean {
  const expiresAt = dismissed[nudgeId];
  if (!expiresAt) return false;
  return new Date(expiresAt).getTime() > Date.now();
}

function pickNudge(
  surface: RemySurface,
  topPriority: ImprovementItem | null,
  nextUnanswered: SchemaQuestion | null,
  sectionLabelById: Map<string, string>,
  assessment: AssessmentRow,
  dismissed: Record<string, string>,
): RemyNudge {
  if (topPriority) {
    const nudgeId = `improve:${topPriority.question_id}`;
    if (!isDismissed(dismissed, nudgeId)) {
      const base = {
        id: nudgeId,
        title: `Prioritize ${topPriority.section_label}`,
        body: `Your answer on "${topPriority.question_text}" has high impact. Improving this now strengthens readiness quickly.`,
      };
      if (surface === "results") {
        return {
          ...base,
          cta: { label: "Review action plan", href: "/results#action-plan" },
        };
      }
      if (surface === "section_summary") {
        return {
          ...base,
          cta: { label: "Review this section", href: `/readiness?section=${topPriority.section_id}` },
        };
      }
      const returnTo = resolveReturnTo(surface);
      return {
        ...base,
        cta: {
          label: "Do this now",
          href: `/readiness?section=${topPriority.section_id}&question=${topPriority.question_id}&returnTo=${returnTo}`,
        },
      };
    }
  }

  if (nextUnanswered) {
    const sectionLabel = sectionLabelById.get(nextUnanswered.section_id) || "next section";
    const nudgeId = `continue:${nextUnanswered.id}`;
    if (!isDismissed(dismissed, nudgeId)) {
      return {
        id: nudgeId,
        title: `Continue ${sectionLabel}`,
        body: "A few more answers unlock clearer recommendations and better prioritization.",
        cta: {
          label: "Continue",
          href: `/readiness?section=${nextUnanswered.section_id}&question=${nextUnanswered.id}`,
        },
      };
    }
  }

  if (assessment.report_status === "generating") {
    return {
      id: "report:generating",
      title: "Your report is updating",
      body: "Remy is preparing refreshed guidance from your latest answers.",
      cta: { label: "View progress", href: "/results" },
    };
  }

  if (assessment.report_status === "ready" && assessment.report_stale) {
    return {
      id: "report:stale",
      title: "Your guidance can be refreshed",
      body: "You made updates. Remy will keep priorities aligned with your latest state as the report refreshes.",
      cta: { label: "Open report", href: "/results" },
    };
  }

  if (assessment.report_status === "ready") {
    return {
      id: "report:ready",
      title: "Review your latest priorities",
      body: "Remy has identified focused next actions in your report and roadmap.",
      cta: { label: "Open report", href: "/results" },
    };
  }

  return {
    id: "remy:start",
    title: "Start your readiness plan",
    body: "Answering your first section gives Remy enough context to prioritize meaningful next steps.",
    cta: { label: "Start assessment", href: "/readiness" },
  };
}

function describePriorityReason(item: ImprovementItem): string {
  if (item.priority === "HIGH") {
    return "Completing this step now can make a meaningful difference in your readiness plan.";
  }
  if (item.priority === "MEDIUM") {
    return "This step can strengthen your readiness and is worth tackling soon.";
  }
  return "This step keeps your plan complete and up to date.";
}

function describeExplanationBody(item: ImprovementItem): string {
  if (item.priority === "HIGH") {
    return "This is one of the strongest opportunities to improve your readiness right now.";
  }
  if (item.priority === "MEDIUM") {
    return "This is a useful next step to keep your readiness momentum going.";
  }
  return "This item still supports your overall readiness progress.";
}

type BuildRemySurfacePayloadInput = {
  assessment: AssessmentRow | null;
  schema: Schema | null;
  profile: Record<string, unknown>;
  answers: AnswerRow[];
  dismissed: Record<string, string>;
  surface: RemySurface;
  sectionId?: string;
};

export function buildRemySurfacePayload({
  assessment,
  schema,
  profile,
  answers,
  dismissed,
  surface,
  sectionId,
}: BuildRemySurfacePayloadInput): RemySurfacePayload {
  if (!assessment || !schema) {
    return emptySurfacePayload(surface);
  }

  const answerMap = new Map<string, AnswerRow>();
  const answerValues: Record<string, AnswerValue> = {};
  for (const answer of answers) {
    answerMap.set(answer.question_id, answer);
    answerValues[answer.question_id] = answer.answer_value;
  }

  const sectionLabelById = new Map<string, string>();
  const sectionWeightById = new Map<string, number>();
  for (const section of schema.sections) {
    sectionLabelById.set(section.id, section.label);
    sectionWeightById.set(section.id, section.weight || 1);
  }

  const applicableQuestions = schema.questions.filter((q) =>
    evaluateCondition(q.applies_if, profile, answerValues),
  );

  const sectionStats = new Map<string, { total: number; answered: number }>();
  for (const q of applicableQuestions) {
    const current = sectionStats.get(q.section_id) || { total: 0, answered: 0 };
    current.total += 1;
    if (answerMap.has(q.id)) current.answered += 1;
    sectionStats.set(q.section_id, current);
  }

  const totalApplicable = applicableQuestions.length;
  const totalAnswered = applicableQuestions.filter((question) => answerMap.has(question.id)).length;
  const progressPercent = totalApplicable > 0 ? Math.round((totalAnswered / totalApplicable) * 100) : 0;

  const completedSections = Array.from(sectionStats.values()).filter(
    (s) => s.total > 0 && s.total === s.answered,
  ).length;

  const improvements: ImprovementItem[] = [];
  for (const q of applicableQuestions) {
    const answer = answerMap.get(q.id);
    if (!answer) continue;
    const scoreFraction = answer.score_fraction ?? 0;
    if (scoreFraction >= 1) continue;

    const sectionWeight = sectionWeightById.get(q.section_id) || 1;
    const sectionLabel = sectionLabelById.get(q.section_id) || q.section_id;
    const priority = getPriority(scoreFraction, sectionWeight);
    const priorityScore = buildPriorityScore(scoreFraction, sectionWeight, answer.answer_value, assessment.report_stale);

    improvements.push({
      question_id: q.id,
      section_id: q.section_id,
      section_label: sectionLabel,
      question_text: answer.question_text || q.prompt,
      current_answer: answer.answer_value,
      current_answer_label: answer.answer_label || answer.answer_value,
      score_fraction: scoreFraction,
      section_weight: sectionWeight,
      priority,
      priority_score: priorityScore,
    });
  }

  improvements.sort((a, b) => b.priority_score - a.priority_score);

  let scopedImprovements = improvements;
  if (surface === "section_summary" && sectionId) {
    scopedImprovements = improvements.filter((item) => item.section_id === sectionId);
  }

  const priorities = scopedImprovements.slice(0, 3).map((item) => ({
    id: item.question_id,
    title: item.question_text,
    priority: item.priority,
    why_now: describePriorityReason(item),
    target_href: `/readiness?section=${item.section_id}&question=${item.question_id}&returnTo=${resolveReturnTo(surface)}`,
  }));

  const topPriority = scopedImprovements[0] || null;
  const nextUnanswered = applicableQuestions.find((q) => !answerMap.has(q.id)) || null;

  const nudge = pickNudge(surface, topPriority, nextUnanswered, sectionLabelById, assessment, dismissed);

  const explanations = (scopedImprovements.length > 0 ? scopedImprovements.slice(0, 2) : []).map((item) => ({
    id: `exp:${item.question_id}`,
    title: `Why ${item.section_label} is prioritized`,
    body: describeExplanationBody(item),
    source_refs: [
      `section:${item.section_id}`,
      `question:${item.question_id}`,
      `assessment:report_status:${assessment.report_status}`,
    ],
  }));

  if (assessment.report_stale) {
    explanations.push({
      id: "exp:report-stale",
      title: "Why your report status matters",
      body: "Recent answer/profile updates are being reflected so priorities stay aligned with your latest state.",
      source_refs: ["assessment:report_stale", "assessment:last_answer_at"],
    });
  }

  return {
    surface,
    generated_at: new Date().toISOString(),
    domain_scope: "rest_easy_readiness",
    nudge,
    explanations,
    priorities,
    reassurance: buildReassurance(
      progressPercent,
      completedSections,
      assessment.overall_score ?? null,
      assessment.report_stale,
    ),
  };
}
