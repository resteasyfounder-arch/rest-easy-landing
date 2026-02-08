export interface RescueMission {
  title: string;
  steps: string[];
}

export interface FindabilityQuestion {
  id: string;
  question: string;
  whyWeAsk: string;
  riskLabel: string;
  category: "access" | "documents" | "healthcare" | "financial" | "digital";
  categoryLabel: string;
  categoryIcon: string;
  guidance: {
    yes: string;
    somewhat: string;
    no: string;
  };
  rescueMission: RescueMission;
  reflectionText?: Record<AnswerValue, string>;
}

// Answer options with warmer labels
export const answerLabels: Record<AnswerValue, string> = {
  yes: "Yes, I have this covered",
  somewhat: "I'm working on it",
  no: "Not yet",
};

export const findabilityQuestions: FindabilityQuestion[] = [
  {
    id: "someone-test",
    question: "Is there someone who knows they'd be the one to step in if you couldn't?",
    whyWeAsk: "Having someone who knows they're your person — that's the foundation everything else builds on.",
    riskLabel: "The right person may not know they're supposed to step in.",
    category: "access",
    categoryLabel: "Your Person",
    categoryIcon: "Users",
    guidance: {
      yes: "You've already taken the most important step — identifying your person. That's the foundation everything else builds on.",
      somewhat: "You have someone in mind, but they may not fully know their role yet. A quick conversation could make all the difference.",
      no: "This is where everyone starts. Choosing your person is the single most important step, and we'll help you figure out who that should be."
    },
    rescueMission: {
      title: "Choose & Inform Your Person",
      steps: [
        "Identify who should be your go-to person",
        "Have the conversation about their role",
        "Document their contact information"
      ]
    },
    reflectionText: {
      yes: "Having someone who knows — that's the foundation.",
      somewhat: "Knowing who to ask is the first step.",
      no: "Most people start exactly here."
    }
  },
  {
    id: "location-test",
    question: "Would that person know where to look first for your important information?",
    whyWeAsk: "Even the most organized plans can fall apart if no one knows where to start looking.",
    riskLabel: "The right person may not know where to start looking.",
    category: "documents",
    categoryLabel: "Document Location",
    categoryIcon: "FolderSearch",
    guidance: {
      yes: "Great — they know where to start. That clarity is more valuable than you might think.",
      somewhat: "There's a general idea, but specifics matter when stress is high. Let's make the path crystal clear.",
      no: "No worries — most people haven't thought about this. Creating a simple 'start here' guide takes just minutes."
    },
    rescueMission: {
      title: "Create Your 'Start Here' Guide",
      steps: [
        "List where your critical documents live",
        "Create a simple one-page reference sheet",
        "Share the location with your person"
      ]
    }
  },
  {
    id: "access-test",
    question: "Could that person actually access what they find — logins, passwords, keys?",
    whyWeAsk: "Knowing where something is and being able to use it are two very different things.",
    riskLabel: "The right person may find things but cannot actually access them.",
    category: "access",
    categoryLabel: "Access & Passwords",
    categoryIcon: "Key",
    guidance: {
      yes: "You've thought ahead about access. That's more than most people do — and it could save hours of frustration.",
      somewhat: "Some access exists, but there may be gaps when it matters most. Let's identify what's missing.",
      no: "This is one of the most common blind spots we see. The good news? It's completely fixable with the right setup."
    },
    rescueMission: {
      title: "Unlock Access for Your Person",
      steps: [
        "Set up a secure password sharing system",
        "Document where critical credentials live",
        "Test that your person can actually log in"
      ]
    },
  },
  {
    id: "document-reality",
    question: "Are your important documents stored somewhere on purpose — not scattered across email, drawers, or devices?",
    whyWeAsk: "A little intentional organization now saves a lot of stress for the people you care about.",
    riskLabel: "Important documents are scattered and hard to find under stress.",
    category: "documents",
    categoryLabel: "Document Organization",
    categoryIcon: "FileStack",
    guidance: {
      yes: "Intentional organization is a gift to your future self and your loved ones. Well done.",
      somewhat: "Some things are organized, others are scattered. Let's create one central hub for what matters most.",
      no: "You're not alone — most people's important documents are spread across a dozen places. We'll help you consolidate."
    },
    rescueMission: {
      title: "Consolidate Your Critical Documents",
      steps: [
        "Identify your top 10 most important documents",
        "Choose one secure central location",
        "Move or copy everything to that hub"
      ]
    },
  },
  {
    id: "healthcare-moment",
    question: "If you were in an emergency room, could someone quickly show who can speak for you medically?",
    whyWeAsk: "In medical moments, having the right paperwork accessible can prevent delays and confusion.",
    riskLabel: "Medical decisions could be delayed when seconds matter most.",
    category: "healthcare",
    categoryLabel: "Healthcare Decisions",
    categoryIcon: "Heart",
    guidance: {
      yes: "This is huge. Having medical documents accessible can literally change outcomes in emergencies.",
      somewhat: "The documents may exist, but accessibility matters. Seconds count in medical situations.",
      no: "This is a critical gap, but it's also one of the fastest to fix. We'll walk you through exactly what you need."
    },
    rescueMission: {
      title: "Prepare Your Healthcare Access Kit",
      steps: [
        "Locate or create your healthcare directive",
        "Ensure your medical proxy has a copy",
        "Store a digital copy they can access instantly"
      ]
    },
    reflectionText: {
      yes: "Having this ready can change outcomes when it matters most.",
      somewhat: "The right document in the right hands — we'll help you get there.",
      no: "This is one of the fastest things to set up."
    }
  },
  {
    id: "money-monday",
    question: "Could someone manage basic finances and pay critical bills for a few weeks without major confusion?",
    whyWeAsk: "Bills don't pause for difficult times. A little clarity here goes a long way.",
    riskLabel: "Critical bills could go unpaid, creating cascading problems.",
    category: "financial",
    categoryLabel: "Financial Basics",
    categoryIcon: "Wallet",
    guidance: {
      yes: "You've set things up so the lights stay on. That peace of mind is invaluable.",
      somewhat: "Some things are covered, but there might be gaps. Let's make sure nothing falls through the cracks.",
      no: "This is more common than you'd think. A simple financial overview document can prevent a lot of chaos."
    },
    rescueMission: {
      title: "Create Your Financial Overview",
      steps: [
        "List all recurring bills and due dates",
        "Document account access information",
        "Set up authorized access for critical accounts"
      ]
    },
  },
  {
    id: "phone-problem",
    question: "If your phone or computer were unavailable, could someone still find what they need?",
    whyWeAsk: "So much of our lives live on our devices now. It's worth thinking about a backup plan.",
    riskLabel: "Too much critical information is locked in inaccessible devices.",
    category: "digital",
    categoryLabel: "Digital Access",
    categoryIcon: "Smartphone",
    guidance: {
      yes: "You've got a backup plan for your digital life. That's forward-thinking.",
      somewhat: "Some things are accessible offline, but your digital footprint might have gaps.",
      no: "Our digital lives are vast and often locked behind screens. Let's create a backup access plan."
    },
    rescueMission: {
      title: "Build Your Digital Backup Plan",
      steps: [
        "Set up device access for your person",
        "Document your most critical digital accounts",
        "Create offline backups of irreplaceable files"
      ]
    }
  },
  {
    id: "only-you-know",
    question: "Are there important details only you know that others would struggle to figure out?",
    whyWeAsk: "We all carry little details that would be hard for others to piece together. That's completely normal.",
    riskLabel: "Important details live only in your head and would be lost.",
    category: "documents",
    categoryLabel: "Personal Knowledge",
    categoryIcon: "Brain",
    guidance: {
      yes: "You've already started documenting the things only you know. That's a gift to your loved ones.",
      somewhat: "Some things are documented, but there's probably more in your head than you realize.",
      no: "This is universal — we all carry knowledge that isn't written down anywhere. Let's start capturing it."
    },
    rescueMission: {
      title: "Document Your Personal Knowledge",
      steps: [
        "Brain dump the things only you know",
        "Organize by category (accounts, contacts, preferences)",
        "Store securely where your person can access it"
      ]
    },
    reflectionText: {
      yes: "Capturing what only you know — that's a gift.",
      somewhat: "More lives in your head than you might realize.",
      no: "We all carry things that aren't written down."
    },
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

export function getWeakestCategory(answers: Record<string, AnswerValue>): FindabilityQuestion | null {
  let lowestScore = Infinity;
  let weakestQuestion: FindabilityQuestion | null = null;

  for (const question of findabilityQuestions) {
    const answer = answers[question.id];
    if (answer) {
      const score = answerScores[answer];
      if (score < lowestScore) {
        lowestScore = score;
        weakestQuestion = question;
      }
    }
  }

  return weakestQuestion;
}
