export type AnswerValue = "yes" | "partial" | "no" | "not_sure" | "na";
export type Priority = "HIGH" | "MEDIUM" | "LOW";
export type RemyScoreBand =
  | "early_readiness"
  | "developing_readiness"
  | "advancing_readiness"
  | "near_full_readiness"
  | "score_unavailable";

export function evaluateCondition(
  expression: string | undefined,
  profile: Record<string, unknown>,
  answers: Record<string, AnswerValue>,
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

export function getPriority(scoreFraction: number, sectionWeight: number): Priority {
  if (sectionWeight >= 15 && scoreFraction < 0.5) return "HIGH";
  if (sectionWeight >= 10 || scoreFraction === 0) return "MEDIUM";
  return "LOW";
}

export function buildPriorityScore(
  scoreFraction: number,
  sectionWeight: number,
  answerValue: string,
  reportStale: boolean,
): number {
  let score = sectionWeight * (1 - scoreFraction) * 10;
  if (answerValue === "no") score += 20;
  if (answerValue === "not_sure") score += 12;
  if (reportStale) score += 5;
  return score;
}

export function getScoreBand(overallScore: number | null | undefined): RemyScoreBand {
  if (typeof overallScore !== "number" || Number.isNaN(overallScore)) return "score_unavailable";
  if (overallScore < 40) return "early_readiness";
  if (overallScore < 60) return "developing_readiness";
  if (overallScore < 80) return "advancing_readiness";
  return "near_full_readiness";
}

function scoreBandTitle(scoreBand: RemyScoreBand): string {
  switch (scoreBand) {
    case "early_readiness":
      return "You're in early readiness";
    case "developing_readiness":
      return "You're building readiness";
    case "advancing_readiness":
      return "You're advancing your readiness";
    case "near_full_readiness":
      return "You're near full readiness";
    case "score_unavailable":
    default:
      return "You can start small";
  }
}

function scoreBandBody(scoreBand: RemyScoreBand): string {
  switch (scoreBand) {
    case "early_readiness":
      return "Start with one focused step and build momentum from there.";
    case "developing_readiness":
      return "You have momentum. Targeting your highest-impact gaps will move your score meaningfully.";
    case "advancing_readiness":
      return "Your foundation is taking shape. Focused updates now can materially strengthen your plan.";
    case "near_full_readiness":
      return "Most key items are in place. Remy can help you close the remaining high-value gaps.";
    case "score_unavailable":
    default:
      return "A single completed step creates momentum. Remy will keep the path focused and manageable.";
  }
}

export function buildReassurance(
  progressPercent: number,
  completedSections: number,
  overallScore?: number | null,
  reportStale?: boolean,
) {
  const scoreBand = getScoreBand(overallScore);
  if (scoreBand === "score_unavailable") {
    if (progressPercent === 0) {
      return {
        title: "You can start small",
        body: "A single completed step creates momentum. Remy will keep the path focused and manageable.",
      };
    }
    if (progressPercent < 40) {
      return {
        title: "Early progress matters",
        body:
          `You've already moved key planning work forward. ${completedSections} section${
            completedSections === 1 ? "" : "s"
          } complete is meaningful progress.`,
      };
    }
    if (progressPercent < 80) {
      return {
        title: "You're building real coverage",
        body: "Your foundation is in place. Prioritizing a few high-impact gaps now will materially improve readiness.",
      };
    }
    return {
      title: "You're making strong progress",
      body: "You have substantial coverage in place. Remy will help you finish the remaining high-value items with clarity.",
    };
  }

  if (scoreBand === "near_full_readiness" && progressPercent < 80) {
    return {
      title: "You're advancing your readiness",
      body: reportStale
        ? "Your score is strong, and recent updates are still being reflected. Keep focusing on your next best step."
        : "Your score is strong. Keep focusing on your next best step to lock in full readiness confidence.",
    };
  }

  return {
    title: scoreBandTitle(scoreBand),
    body: reportStale
      ? `${scoreBandBody(scoreBand)} Recent updates are still being reflected in your report.`
      : scoreBandBody(scoreBand),
  };
}
