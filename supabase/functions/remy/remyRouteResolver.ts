import type { RemySurface, Schema } from "./remyPayloadBuilder.ts";

export type RemyRouteType = "readiness_question" | "vault_upload" | "vault_edit" | "app_section";

export type RemyRouteOption = {
  routeType: RemyRouteType;
  href: string;
  label: string;
  targetId: string;
};

export type RemyRouteResolution = RemyRouteOption & {
  confidence: number;
  ambiguous: boolean;
  alternatives: RemyRouteOption[];
  vaultDocTargeted?: string;
};

export type RemyNavigationTarget = {
  id: string;
  href: string;
  label: string;
  purpose: string;
  keywords: string[];
};

type VaultDocCatalogItem = {
  id: string;
  name: string;
  category: string;
  priority: "high" | "medium" | "low";
  inputMethod: "upload" | "inline";
  keywords: string[];
};

type ScoredCandidate<T> = {
  item: T;
  score: number;
};

const HEALTH_DIRECTIVE_PATTERN = /\b(health\s*care|healthcare|medical)\s+(directive|advance\s+directive|living\s+will)\b/i;

export const REMY_NAVIGATION_TARGETS: RemyNavigationTarget[] = [
  {
    id: "dashboard",
    href: "/dashboard",
    label: "Dashboard",
    purpose: "See your current readiness snapshot and top priorities.",
    keywords: ["dashboard", "home", "overview", "score", "status"],
  },
  {
    id: "profile",
    href: "/profile",
    label: "My Profile",
    purpose: "Update your profile details that personalize guidance.",
    keywords: ["profile", "personal info", "family", "household", "trust network"],
  },
  {
    id: "readiness",
    href: "/readiness",
    label: "Life Readiness",
    purpose: "Answer or update readiness questions section by section.",
    keywords: ["readiness", "assessment", "question", "section", "update answer", "edit question"],
  },
  {
    id: "results",
    href: "/results",
    label: "Readiness Report",
    purpose: "Review your generated report, strengths, and action plan.",
    keywords: ["report", "results", "summary", "strengths", "doing well", "action plan"],
  },
  {
    id: "vault",
    href: "/vault",
    label: "EasyVault",
    purpose: "Upload and manage key documents for your readiness journey.",
    keywords: ["vault", "documents", "upload", "file", "directive", "will", "beneficiary"],
  },
  {
    id: "menu",
    href: "/menu",
    label: "Menu",
    purpose: "Open app tools and quick access navigation options.",
    keywords: ["menu", "settings", "tools"],
  },
];

export const REMY_VAULT_DOC_CATALOG: VaultDocCatalogItem[] = [
  {
    id: "healthcare-directive",
    name: "Healthcare Directive",
    category: "healthcare",
    priority: "high",
    inputMethod: "upload",
    keywords: ["healthcare directive", "health directive", "advance directive", "living will", "medical directive"],
  },
  {
    id: "hipaa-authorization",
    name: "HIPAA Authorization",
    category: "healthcare",
    priority: "high",
    inputMethod: "upload",
    keywords: ["hipaa", "medical release", "authorization"],
  },
  {
    id: "beneficiary-designations",
    name: "Beneficiary Designations",
    category: "legal",
    priority: "high",
    inputMethod: "upload",
    keywords: ["beneficiary", "beneficiaries", "designation", "designations"],
  },
  {
    id: "will-testament",
    name: "Will / Testament",
    category: "legal",
    priority: "high",
    inputMethod: "upload",
    keywords: ["will", "testament", "last will"],
  },
  {
    id: "power-of-attorney",
    name: "Power of Attorney",
    category: "legal",
    priority: "high",
    inputMethod: "upload",
    keywords: ["power of attorney", "poa"],
  },
  {
    id: "trust-documents",
    name: "Trust Documents",
    category: "legal",
    priority: "medium",
    inputMethod: "upload",
    keywords: ["trust", "living trust", "trust document"],
  },
  {
    id: "retirement-accounts",
    name: "Retirement Accounts",
    category: "financial",
    priority: "high",
    inputMethod: "upload",
    keywords: ["401k", "retirement", "ira", "pension", "retirement account"],
  },
  {
    id: "bank-accounts",
    name: "Bank Accounts",
    category: "financial",
    priority: "high",
    inputMethod: "upload",
    keywords: ["bank account", "checking", "savings"],
  },
  {
    id: "digital-account-inventory",
    name: "Digital Account Inventory",
    category: "digital",
    priority: "high",
    inputMethod: "inline",
    keywords: ["digital account", "online account", "account inventory"],
  },
  {
    id: "letter-of-intent",
    name: "Letter of Intent / Personal Wishes",
    category: "personal",
    priority: "medium",
    inputMethod: "inline",
    keywords: ["letter of intent", "personal wishes", "wishes"],
  },
];

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toTokens(value: string): Set<string> {
  return new Set(normalizeText(value).split(" ").filter((token) => token.length >= 3));
}

function scoreTextMatch(message: string, candidates: string[]): number {
  const normalizedMessage = normalizeText(message);
  const messageTokens = toTokens(message);
  let score = 0;

  for (const phrase of candidates) {
    const normalizedPhrase = normalizeText(phrase);
    if (!normalizedPhrase) continue;

    if (normalizedMessage.includes(normalizedPhrase)) {
      score += 6;
    }

    const phraseTokens = toTokens(phrase);
    for (const token of phraseTokens) {
      if (messageTokens.has(token)) score += 1;
    }
  }

  return score;
}

function scoreConfidence(score: number): number {
  const raw = 0.35 + score * 0.07;
  return Math.max(0, Math.min(0.99, raw));
}

function resolveReturnTo(surface: RemySurface): string {
  if (surface === "profile") return "profile";
  if (surface === "menu") return "menu";
  if (surface === "vault") return "vault";
  if (surface === "results") return "results";
  if (surface === "readiness") return "readiness";
  return "dashboard";
}

function questionLabel(prompt: string): string {
  const cleaned = prompt.replace(/\s+/g, " ").trim();
  if (!cleaned) return "Open readiness question";
  return cleaned.length > 96 ? `${cleaned.slice(0, 93)}...` : cleaned;
}

function isLikelyAmbiguous<T>(ranked: ScoredCandidate<T>[]): boolean {
  if (ranked.length < 2) return false;
  const [best, second] = ranked;
  if (best.score <= 0 || second.score <= 0) return false;
  return second.score >= best.score - 1;
}

export function listVaultCatalog(): VaultDocCatalogItem[] {
  return REMY_VAULT_DOC_CATALOG.slice();
}

export function resolveVaultRoute(message: string): RemyRouteResolution | null {
  const normalized = normalizeText(message);
  if (!normalized) return null;

  const asksVault = /\b(vault|upload|document|file|add|store|save|edit|update)\b/.test(normalized) ||
    HEALTH_DIRECTIVE_PATTERN.test(message);
  if (!asksVault) return null;

  const action: "upload" | "edit" = /\b(edit|update|change|fix|replace)\b/.test(normalized) ? "edit" : "upload";
  const ranked = REMY_VAULT_DOC_CATALOG
    .map((item) => {
      let score = scoreTextMatch(normalized, [item.name, ...item.keywords]);
      if (item.priority === "high") score += 1;
      if (item.inputMethod === "inline" && action === "edit") score += 1;
      return { item, score };
    })
    .sort((left, right) => right.score - left.score);

  const best = ranked[0];
  if (!best || best.score < 3) {
    return {
      routeType: "app_section",
      href: "/vault",
      label: "Open EasyVault",
      targetId: "vault",
      confidence: 0.5,
      ambiguous: false,
      alternatives: [],
    };
  }

  const effectiveAction = best.item.inputMethod === "inline" ? "edit" : action;
  const primary: RemyRouteOption = {
    routeType: effectiveAction === "upload" ? "vault_upload" : "vault_edit",
    href: `/vault?doc=${encodeURIComponent(best.item.id)}&action=${effectiveAction}`,
    label: `Open ${best.item.name}`,
    targetId: best.item.id,
  };

  const ambiguous = isLikelyAmbiguous(ranked);
  const alternatives = ambiguous
    ? ranked
      .slice(1, 3)
      .filter((item) => item.score > 0)
      .map((item) => {
        const altAction = item.item.inputMethod === "inline" ? "edit" : action;
        return {
          routeType: altAction === "upload" ? "vault_upload" as const : "vault_edit" as const,
          href: `/vault?doc=${encodeURIComponent(item.item.id)}&action=${altAction}`,
          label: `Open ${item.item.name}`,
          targetId: item.item.id,
        };
      })
    : [];

  return {
    ...primary,
    confidence: scoreConfidence(best.score),
    ambiguous,
    alternatives,
    vaultDocTargeted: best.item.id,
  };
}

export function resolveReadinessQuestionRoute(
  message: string,
  schema: Schema | null,
  surface: RemySurface,
): RemyRouteResolution | null {
  if (!schema || !Array.isArray(schema.questions) || schema.questions.length === 0) return null;

  const normalized = normalizeText(message);
  if (!normalized) return null;

  const asksReadiness = /\b(readiness|question|answer|section|update|change|edit|beneficiar|trust|will|directive|poa)\b/
    .test(normalized);
  if (!asksReadiness) return null;

  const ranked = schema.questions
    .map((question) => {
      let score = scoreTextMatch(normalized, [question.prompt, question.id]);
      const prompt = normalizeText(question.prompt);
      if (/beneficiar/.test(normalized) && /beneficiar/.test(prompt)) score += 4;
      if (/trust/.test(normalized) && /trust/.test(prompt)) score += 3;
      if (/\bwill\b/.test(normalized) && /\bwill\b/.test(prompt)) score += 3;
      if (/directive/.test(normalized) && /directive/.test(prompt)) score += 3;
      return { item: question, score };
    })
    .sort((left, right) => right.score - left.score);

  const best = ranked[0];
  if (!best || best.score < 2) return null;

  const returnTo = resolveReturnTo(surface);
  const primary: RemyRouteOption = {
    routeType: "readiness_question",
    href: `/readiness?section=${encodeURIComponent(best.item.section_id)}&question=${encodeURIComponent(best.item.id)}&returnTo=${encodeURIComponent(returnTo)}`,
    label: questionLabel(best.item.prompt),
    targetId: best.item.id,
  };

  const ambiguous = isLikelyAmbiguous(ranked);
  const alternatives = ambiguous
    ? ranked
      .slice(1, 3)
      .filter((item) => item.score > 0)
      .map((item) => ({
        routeType: "readiness_question" as const,
        href: `/readiness?section=${encodeURIComponent(item.item.section_id)}&question=${encodeURIComponent(item.item.id)}&returnTo=${encodeURIComponent(returnTo)}`,
        label: questionLabel(item.item.prompt),
        targetId: item.item.id,
      }))
    : [];

  return {
    ...primary,
    confidence: scoreConfidence(best.score),
    ambiguous,
    alternatives,
  };
}

export function resolveNavigationRoute(message: string): RemyRouteResolution | null {
  const normalized = normalizeText(message);
  if (!normalized) return null;

  const asksNavigation = /\b(where|navigate|go to|open|find|lost|take me|show me)\b/.test(normalized);
  if (!asksNavigation) return null;

  const ranked = REMY_NAVIGATION_TARGETS
    .map((target) => ({
      item: target,
      score: scoreTextMatch(normalized, [target.label, ...target.keywords]),
    }))
    .sort((left, right) => right.score - left.score);

  const best = ranked[0];
  if (!best || best.score < 2) return {
    routeType: "app_section",
    href: "/dashboard",
    label: "Open Dashboard",
    targetId: "dashboard",
    confidence: 0.45,
    ambiguous: false,
    alternatives: [],
  };

  const ambiguous = isLikelyAmbiguous(ranked);
  const alternatives = ambiguous
    ? ranked
      .slice(1, 3)
      .filter((item) => item.score > 0)
      .map((item) => ({
        routeType: "app_section" as const,
        href: item.item.href,
        label: `Open ${item.item.label}`,
        targetId: item.item.id,
      }))
    : [];

  return {
    routeType: "app_section",
    href: best.item.href,
    label: `Open ${best.item.label}`,
    targetId: best.item.id,
    confidence: scoreConfidence(best.score),
    ambiguous,
    alternatives,
  };
}

export function resolveRouteForMessage(params: {
  message: string;
  schema: Schema | null;
  surface: RemySurface;
}): RemyRouteResolution | null {
  const vault = resolveVaultRoute(params.message);
  if (vault) return vault;

  const readiness = resolveReadinessQuestionRoute(params.message, params.schema, params.surface);
  if (readiness) return readiness;

  return resolveNavigationRoute(params.message);
}

export function findNavigationTargetById(targetId: string): RemyNavigationTarget | null {
  return REMY_NAVIGATION_TARGETS.find((item) => item.id === targetId) || null;
}
