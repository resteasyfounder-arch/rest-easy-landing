export interface FindabilityQuestion {
  id: string;
  question: string;
  insight: string;
  riskLabel: string;
}

export const findabilityQuestions: FindabilityQuestion[] = [
  {
    id: "someone-test",
    question: "Is there at least one person who would know they're supposed to step in if something happened to you?",
    insight: "This reveals whether you have role clarity — someone who knows they're the one.",
    riskLabel: "The right person may not know they're supposed to step in.",
  },
  {
    id: "location-test",
    question: "Would that person know where to look first to find your important information?",
    insight: "This exposes the 'it's in my head' risk — when knowledge isn't accessible.",
    riskLabel: "The right person may not know where to start looking.",
  },
  {
    id: "access-test",
    question: "Could that person actually access what they find (logins, passwords, physical access)?",
    insight: "This separates 'I told them' from 'they can actually act.'",
    riskLabel: "The right person may find things but cannot actually access them.",
  },
  {
    id: "document-reality",
    question: "Are your most important documents stored somewhere intentionally — not just scattered across email, drawers, or devices?",
    insight: "Most people think they're organized. This gently exposes chaos.",
    riskLabel: "Important documents are scattered and hard to find under stress.",
  },
  {
    id: "healthcare-moment",
    question: "If you were in an emergency room, could someone quickly show proof of who can speak for you medically?",
    insight: "A concrete, high-stakes scenario that cuts through vague thinking.",
    riskLabel: "Medical decisions could be delayed when seconds matter most.",
  },
  {
    id: "money-monday",
    question: "Could someone pay critical bills or manage basic finances for the first few weeks without major confusion?",
    insight: "Bills and utilities are immediate pain points that can't wait.",
    riskLabel: "Critical bills could go unpaid, creating cascading problems.",
  },
  {
    id: "phone-problem",
    question: "If your phone or computer were unavailable, could someone still find what they need?",
    insight: "A modern, underrated risk. So much lives only on our devices.",
    riskLabel: "Too much critical information is locked in inaccessible devices.",
  },
  {
    id: "only-you-know",
    question: "Are there important details only you know that others would struggle to figure out quickly?",
    insight: "This catches hidden obligations — service providers, routines, and more.",
    riskLabel: "Important details live only in your head and would be lost.",
  },
];

export type AnswerValue = "yes" | "somewhat" | "no";

export const answerScores: Record<AnswerValue, number> = {
  yes: 10,
  somewhat: 5,
  no: 0,
};

export const scoreTiers = {
  strong: { min: 70, label: "Findability Strong", color: "green" },
  unclear: { min: 40, label: "Findability Unclear", color: "amber" },
  fragile: { min: 0, label: "Findability Fragile", color: "red" },
} as const;

export function calculateScore(answers: Record<string, AnswerValue>): number {
  const rawScore = Object.values(answers).reduce((sum, answer) => {
    return sum + answerScores[answer];
  }, 0);
  
  const maxScore = findabilityQuestions.length * 10;
  return Math.round((rawScore / maxScore) * 100);
}

export function getScoreTier(score: number) {
  if (score >= scoreTiers.strong.min) return scoreTiers.strong;
  if (score >= scoreTiers.unclear.min) return scoreTiers.unclear;
  return scoreTiers.fragile;
}

export function getBiggestRisk(answers: Record<string, AnswerValue>): string {
  let lowestScore = Infinity;
  let riskLabel = findabilityQuestions[0].riskLabel;

  for (const question of findabilityQuestions) {
    const answer = answers[question.id];
    if (answer) {
      const score = answerScores[answer];
      if (score < lowestScore) {
        lowestScore = score;
        riskLabel = question.riskLabel;
      }
    }
  }

  return riskLabel;
}
