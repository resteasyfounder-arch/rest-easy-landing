export interface FindabilityQuestion {
  id: string;
  question: string;
  whyWeAsk: string;
  riskLabel: string;
}

export const findabilityQuestions: FindabilityQuestion[] = [
  {
    id: "someone-test",
    question: "Is there at least one person who would know they're supposed to step in if something happened to you?",
    whyWeAsk: "Having someone who knows they're your person can make all the difference when it matters most.",
    riskLabel: "The right person may not know they're supposed to step in.",
  },
  {
    id: "location-test",
    question: "Would that person know where to look first to find your important information?",
    whyWeAsk: "Even the most organized plans can fall apart if no one knows where to start looking.",
    riskLabel: "The right person may not know where to start looking.",
  },
  {
    id: "access-test",
    question: "Could that person actually access what they find (logins, passwords, physical access)?",
    whyWeAsk: "Knowing where something is and being able to use it are two very different things.",
    riskLabel: "The right person may find things but cannot actually access them.",
  },
  {
    id: "document-reality",
    question: "Are your most important documents stored somewhere intentionally — not just scattered across email, drawers, or devices?",
    whyWeAsk: "A little intentional organization now saves a lot of stress for the people you care about.",
    riskLabel: "Important documents are scattered and hard to find under stress.",
  },
  {
    id: "healthcare-moment",
    question: "If you were in an emergency room, could someone quickly show proof of who can speak for you medically?",
    whyWeAsk: "In medical moments, having the right paperwork accessible can prevent delays and confusion.",
    riskLabel: "Medical decisions could be delayed when seconds matter most.",
  },
  {
    id: "money-monday",
    question: "Could someone pay critical bills or manage basic finances for the first few weeks without major confusion?",
    whyWeAsk: "Bills don't pause for difficult times. A little clarity here goes a long way.",
    riskLabel: "Critical bills could go unpaid, creating cascading problems.",
  },
  {
    id: "phone-problem",
    question: "If your phone or computer were unavailable, could someone still find what they need?",
    whyWeAsk: "So much of our lives live on our devices now. It's worth thinking about a backup plan.",
    riskLabel: "Too much critical information is locked in inaccessible devices.",
  },
  {
    id: "only-you-know",
    question: "Are there important details only you know that others would struggle to figure out quickly?",
    whyWeAsk: "We all carry little details that would be hard for others to piece together. That's completely normal.",
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
