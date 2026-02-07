export type AnswerValue = "yes" | "partial" | "no" | "not_sure" | "na";
export type Priority = "HIGH" | "MEDIUM" | "LOW";

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

export function buildReassurance(progressPercent: number, completedSections: number) {
  if (progressPercent === 0) {
    return {
      title: "You can start small",
      body: "A single completed step creates momentum. Remy will keep the path focused and manageable.",
    };
  }
  if (progressPercent < 40) {
    return {
      title: "Early progress matters",
      body: `You've already moved key planning work forward. ${completedSections} section${completedSections === 1 ? "" : "s"} complete is meaningful progress.`,
    };
  }
  if (progressPercent < 80) {
    return {
      title: "You're building real coverage",
      body: "Your foundation is in place. Prioritizing a few high-impact gaps now will materially improve readiness.",
    };
  }
  return {
    title: "You're close to full readiness",
    body: "Most of the hard work is done. Remy will help you finish the remaining high-value items with clarity.",
  };
}
