import { getScoreBand, type RemyScoreBand } from "./decisionEngine.ts";
import type { RemyChatContext, RemyChatTurnResponse } from "./chatTurn.ts";
import type { RemyCapabilityContext } from "./remyCapabilityContext.ts";
import { findNavigationTargetById } from "./remyRouteResolver.ts";

type PriorityItem = RemyChatContext["payload"]["priorities"][number];

type ChatHistoryItem = { role: "user" | "assistant"; text: string };

export type RemyTurnGoal =
  | "greeting"
  | "score_explain"
  | "next_step"
  | "skip_priority"
  | "route_to_question"
  | "question_lookup"
  | "vault_progress"
  | "vault_upload_route"
  | "report_summary"
  | "report_strengths"
  | "ui_wayfinding"
  | "clarification"
  | "out_of_scope";

export type RemyPlannerCapability = "readiness" | "vault" | "report" | "navigation";

export type RemyPlannerPolicyMode = "app_directed_only";

export type RemyConversationState = {
  declined_priority_ids: string[];
  declined_until_by_id: Record<string, string>;
  last_goal?: RemyTurnGoal;
  last_target_question_id?: string;
  last_capability?: RemyPlannerCapability;
  last_route?: string;
  last_report_focus?: "summary" | "strengths";
  last_vault_doc_id?: string;
  turn_count: number;
  last_reassurance_turn?: number;
};

export type RemyPlannerResult = {
  response: RemyChatTurnResponse;
  state: RemyConversationState;
  goal: RemyTurnGoal;
  scoreBand: RemyScoreBand;
  policyMode: RemyPlannerPolicyMode;
  repetitionGuardTriggered: boolean;
  capability?: RemyPlannerCapability;
  routeType?: string;
  routeResolved: boolean;
  ambiguityDetected: boolean;
  vaultDocTargeted?: string;
  reportSummaryMode?: "summary" | "strengths";
  groundingPassed: boolean;
};

const OUT_OF_DOMAIN_PATTERNS = [
  /\bbitcoin\b/i,
  /\bcrypto\b/i,
  /\bstock(s)?\b/i,
  /\belection(s)?\b/i,
  /\bpolitic(s|al)\b/i,
  /\brecipe(s)?\b/i,
  /\bweather\b/i,
  /\bsports?\b/i,
  /\bfantasy\b/i,
];

const APP_DATA_COLLECTION_PATTERNS = [
  /\bwho\s+(would|should|do)\s+you\s+(want|choose|designate)\b/i,
  /\bshare\s+(the\s+)?list\b/i,
  /\blist\s+of\s+accounts\b/i,
  /\bplease\s+share\b/i,
  /\bwhat\s+accounts\s+do\s+you\s+have\b/i,
  /\bwho\s+is\s+the\s+beneficiar/i,
  /\bdesignate\s+the\s+beneficiar/i,
];

const ACTION_REQUEST_PATTERNS = [
  /\bwhat\s+should\s+i\s+do\s+(next|first)\b/i,
  /\bwhere\s+do\s+i\s+start\b/i,
  /\bshow\s+my\s+next\s+step\b/i,
  /\bnext\s+step\b/i,
  /\bopen\b/i,
  /\bgo\s+to\b/i,
  /\bnavigate\b/i,
  /\bupdate\s+this\s+question\b/i,
  /\bupload\b/i,
  /\bwhere\s+can\s+i\b/i,
  /\bwhere\s+is\b/i,
  /\bhow\s+can\s+i\s+upload\b/i,
];

const REPORT_SUMMARY_PATTERNS = [
  /\b(summarize|summary|overview)\b.*\b(report|results|assessment)\b/i,
  /\btell\s+me\s+about\s+my\s+report\b/i,
];

const REPORT_STRENGTH_PATTERNS = [
  /\b(where|what)\s+.*\b(do(ing)?\s+well|strong|strength)\b/i,
  /\b(strengths?|what\s+am\s+i\s+doing\s+well)\b/i,
];

const VAULT_PROGRESS_PATTERNS = [
  /\b(vault|documents?)\b.*\b(progress|status|complete|completion|missing)\b/i,
  /\bhow\s+is\s+my\s+vault\b/i,
];

const VAULT_UPLOAD_PATTERNS = [
  /\b(upload|add|store|save|edit|update)\b.*\b(document|documents|file|files|directive|will|vault|beneficiar)\b/i,
  /\bhow\s+can\s+i\s+upload\b/i,
  /\bwhere\s+can\s+i\s+upload\b/i,
];

const WAYFINDING_PATTERNS = [
  /\bi'?m\s+lost\b/i,
  /\bwhere\s+(do|can)\s+i\b/i,
  /\bwhere\s+is\b/i,
  /\bhow\s+do\s+i\s+find\b/i,
  /\bnavigate\b/i,
  /\btake\s+me\s+to\b/i,
];

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenSet(value: string): Set<string> {
  return new Set(normalizeText(value).split(" ").filter((token) => token.length >= 3));
}

function jaccardSimilarity(left: string, right: string): number {
  const a = tokenSet(left);
  const b = tokenSet(right);
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  for (const token of a) {
    if (b.has(token)) intersection += 1;
  }
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function hasRepetition(candidate: string, history: ChatHistoryItem[]): boolean {
  const assistantTurns = history.filter((item) => item.role === "assistant").slice(-3);
  const normalizedCandidate = normalizeText(candidate);
  for (const item of assistantTurns) {
    const normalizedExisting = normalizeText(item.text);
    if (!normalizedExisting) continue;
    if (normalizedExisting === normalizedCandidate) return true;
    if (jaccardSimilarity(normalizedExisting, normalizedCandidate) >= 0.88) return true;
  }
  return false;
}

function scoreBandSummary(scoreBand: RemyScoreBand, score: number | null | undefined): string {
  if (typeof score !== "number") {
    return "I don't have your latest readiness score yet.";
  }

  switch (scoreBand) {
    case "early_readiness":
      return `Your readiness score is ${score}/100, which is in the early readiness range.`;
    case "developing_readiness":
      return `Your readiness score is ${score}/100, which is in the developing readiness range.`;
    case "advancing_readiness":
      return `Your readiness score is ${score}/100, which is in the advancing readiness range.`;
    case "near_full_readiness":
      return `Your readiness score is ${score}/100, which is in the near full readiness range.`;
    case "score_unavailable":
    default:
      return "I don't have your latest readiness score yet.";
  }
}

function parseDate(value: string | undefined): number {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function sanitizeDeclinedMap(raw: unknown, nowMs: number): Record<string, string> {
  if (!raw || typeof raw !== "object") return {};
  const next: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof key !== "string" || !key.trim()) continue;
    if (typeof value !== "string") continue;
    if (parseDate(value) <= nowMs) continue;
    next[key] = value;
  }
  return next;
}

export function normalizeConversationState(raw: unknown, nowMs = Date.now()): RemyConversationState {
  const input = raw && typeof raw === "object" ? raw as Record<string, unknown> : {};
  const declinedUntilMap = sanitizeDeclinedMap(input.declined_until_by_id, nowMs);
  const declinedPriorityIds = Object.keys(declinedUntilMap);

  const turnCountValue = typeof input.turn_count === "number" && Number.isFinite(input.turn_count)
    ? Math.max(0, Math.floor(input.turn_count))
    : 0;

  const lastGoal = typeof input.last_goal === "string" ? input.last_goal : undefined;
  const safeLastGoal: RemyTurnGoal | undefined =
    lastGoal === "greeting" ||
      lastGoal === "score_explain" ||
      lastGoal === "next_step" ||
      lastGoal === "skip_priority" ||
      lastGoal === "route_to_question" ||
      lastGoal === "question_lookup" ||
      lastGoal === "vault_progress" ||
      lastGoal === "vault_upload_route" ||
      lastGoal === "report_summary" ||
      lastGoal === "report_strengths" ||
      lastGoal === "ui_wayfinding" ||
      lastGoal === "clarification" ||
      lastGoal === "out_of_scope"
      ? lastGoal
      : undefined;

  const lastTargetQuestionId = typeof input.last_target_question_id === "string" && input.last_target_question_id.trim()
    ? input.last_target_question_id
    : undefined;

  const lastReassuranceTurn = typeof input.last_reassurance_turn === "number" && Number.isFinite(input.last_reassurance_turn)
    ? Math.max(0, Math.floor(input.last_reassurance_turn))
    : undefined;

  const rawCapability = typeof input.last_capability === "string" ? input.last_capability : undefined;
  const lastCapability = rawCapability === "readiness" || rawCapability === "vault" || rawCapability === "report" ||
      rawCapability === "navigation"
    ? rawCapability
    : undefined;
  const lastRoute = typeof input.last_route === "string" && input.last_route.startsWith("/")
    ? input.last_route.slice(0, 280)
    : undefined;
  const lastReportFocus = input.last_report_focus === "summary" || input.last_report_focus === "strengths"
    ? input.last_report_focus
    : undefined;
  const lastVaultDocId = typeof input.last_vault_doc_id === "string" && input.last_vault_doc_id.trim()
    ? input.last_vault_doc_id.slice(0, 120)
    : undefined;

  return {
    declined_priority_ids: declinedPriorityIds,
    declined_until_by_id: declinedUntilMap,
    last_goal: safeLastGoal,
    last_target_question_id: lastTargetQuestionId,
    last_capability: lastCapability,
    last_route: lastRoute,
    last_report_focus: lastReportFocus,
    last_vault_doc_id: lastVaultDocId,
    turn_count: turnCountValue,
    last_reassurance_turn: lastReassuranceTurn,
  };
}

function isOutOfDomainMessage(message: string): boolean {
  const normalized = message.trim();
  if (!normalized) return false;
  return OUT_OF_DOMAIN_PATTERNS.some((pattern) => pattern.test(normalized));
}

export function classifyTurnGoal(message: string): RemyTurnGoal {
  const normalized = normalizeText(message);

  if (!normalized) return "clarification";
  if (isOutOfDomainMessage(message)) return "out_of_scope";
  if (/^(hi|hello|hey|good\s+(morning|afternoon|evening))\b/.test(normalized)) return "greeting";
  if (REPORT_STRENGTH_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return "report_strengths";
  }
  if (REPORT_SUMMARY_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return "report_summary";
  }
  if (VAULT_PROGRESS_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return "vault_progress";
  }
  if (VAULT_UPLOAD_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return "vault_upload_route";
  }
  if (WAYFINDING_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return "ui_wayfinding";
  }
  if (/\b(score|rating|grade|why\s+is\s+my\s+score|tell\s+me\s+about\s+my\s+score)\b/.test(normalized)) {
    return "score_explain";
  }
  if (/\b(skip|not\s+ready|don\s*t\s+want|do\s+not\s+want|other\s+options|something\s+else)\b/.test(normalized)) {
    return "skip_priority";
  }
  if (isCompletionTransitionPrompt(message)) {
    return "next_step";
  }
  if (ACTION_REQUEST_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return "next_step";
  }
  if (
    /\b(update|change|edit|set\s*up|setting\s+up|beneficiar|trust|will|power\s+of\s+attorney|advance\s+directive)\b/
      .test(normalized)
  ) {
    return /\b(question|answer|response)\b/.test(normalized) ? "route_to_question" : "question_lookup";
  }
  return "clarification";
}

function isDeclined(priorityId: string, state: RemyConversationState, nowMs: number): boolean {
  const until = state.declined_until_by_id[priorityId];
  if (!until) return false;
  return parseDate(until) > nowMs;
}

function isExplicitlyAskingForPriority(message: string, priority: PriorityItem): boolean {
  const messageTokens = tokenSet(message);
  const priorityTokens = tokenSet(priority.title);
  if (messageTokens.size === 0 || priorityTokens.size === 0) return false;

  let overlap = 0;
  for (const token of priorityTokens) {
    if (messageTokens.has(token)) overlap += 1;
  }
  if (overlap >= 2) return true;

  const normalizedMessage = normalizeText(message);
  const normalizedPriority = normalizeText(priority.title);
  return normalizedPriority.length > 8 && normalizedMessage.includes(normalizedPriority);
}

function findPriorityById(priorities: PriorityItem[], id: string | undefined): PriorityItem | null {
  if (!id) return null;
  return priorities.find((item) => item.id === id) ?? null;
}

function matchPriorityFromMessage(message: string, priorities: PriorityItem[]): PriorityItem | null {
  const normalizedMessage = normalizeText(message);
  const messageTokens = tokenSet(message);

  let best: { item: PriorityItem; score: number } | null = null;
  for (const item of priorities) {
    let score = 0;
    const normalizedTitle = normalizeText(item.title);

    if (normalizedTitle && normalizedMessage.includes(normalizedTitle)) {
      score += 5;
    }

    const titleTokens = tokenSet(item.title);
    for (const token of titleTokens) {
      if (messageTokens.has(token)) score += 1;
    }

    if (/beneficiar/.test(normalizedMessage) && /beneficiar/.test(normalizedTitle)) {
      score += 4;
    }

    if (!best || score > best.score) {
      best = { item, score };
    }
  }

  if (!best || best.score < 2) return null;
  return best.item;
}

function firstEligiblePriority(
  priorities: PriorityItem[],
  state: RemyConversationState,
  nowMs: number,
  message: string,
): PriorityItem | null {
  const explicitMatch = matchPriorityFromMessage(message, priorities);
  if (explicitMatch) return explicitMatch;

  return priorities.find((item) => !isDeclined(item.id, state, nowMs)) ?? priorities[0] ?? null;
}

function fallbackQuickReplies(response: RemyChatTurnResponse): string[] {
  return response.quick_replies.length > 0
    ? response.quick_replies.slice(0, 3)
    : ["What should I focus on first?", "Why is my score where it is?", "What's next after this step?"];
}

function shouldOfferReassurance(goal: RemyTurnGoal): boolean {
  return goal === "greeting";
}

function maybeAppendReassurance(
  message: string,
  state: RemyConversationState,
  goal: RemyTurnGoal,
): { message: string; used: boolean } {
  if (!shouldOfferReassurance(goal)) return { message, used: false };
  if (typeof state.last_reassurance_turn === "number" && state.turn_count - state.last_reassurance_turn < 4) {
    return { message, used: false };
  }
  return {
    message: `${message} We'll take this one step at a time together.`,
    used: true,
  };
}

function isPersonalDataCollectionPrompt(text: string): boolean {
  return APP_DATA_COLLECTION_PATTERNS.some((pattern) => pattern.test(text));
}

function asRouteMessage(
  prefix: string | null,
  target: PriorityItem | null,
  fallbackLabel: string,
): { text: string; cta: RemyChatTurnResponse["cta"] | undefined } {
  const prefixText = prefix ? `${prefix} ` : "";
  if (!target) {
    return {
      text: `${prefixText}I can guide you to the exact readiness question you want to update. Tell me which topic you'd like to work on next.`,
      cta: undefined,
    };
  }

  return {
    text:
      `${prefixText}Let's update this directly in your readiness flow: "${target.title}". Open the question, make your update there, and I'll guide you on what to do next.`,
    cta: {
      id: target.id,
      label: fallbackLabel,
      href: target.target_href,
    },
  };
}

function isCompletionTransitionPrompt(message: string): boolean {
  const normalized = normalizeText(message);
  return (
    /\bwhat\s+(s|is)?\s*next\b/.test(normalized) &&
      /\b(after|once|when)\b/.test(normalized) &&
      /\b(finish|finished|complete|completed|done)\b/.test(normalized)
  ) || /\bi\s+finished\b/.test(normalized) || /\bi\s+completed\b/.test(normalized);
}

function firstAlternativePriority(
  priorities: PriorityItem[],
  state: RemyConversationState,
  nowMs: number,
  excludedId?: string,
): PriorityItem | null {
  return priorities.find((item) => item.id !== excludedId && !isDeclined(item.id, state, nowMs)) ??
    priorities.find((item) => item.id !== excludedId) ??
    null;
}

function fallbackRepetitionMessage(goal: RemyTurnGoal, scoreIntro: string, target: PriorityItem | null): string {
  if (goal === "vault_progress") {
    return "I can help you focus EasyVault by identifying the highest-priority missing document and opening the exact upload step.";
  }
  if (goal === "vault_upload_route") {
    return "I can route you to the exact EasyVault document step so you can upload or edit it directly in the app.";
  }
  if (goal === "report_summary") {
    return "I can summarize your report in plain language and highlight one practical action to take next.";
  }
  if (goal === "report_strengths") {
    return "You have clear strengths in your report, and I can show where you're doing well plus what to maintain.";
  }
  if (goal === "ui_wayfinding" || goal === "question_lookup") {
    return "I can guide you to the right section in the app and open the exact place to update next.";
  }
  if (goal === "score_explain") {
    return target
      ? `${scoreIntro} The clearest way to improve it is by updating "${target.title}" in your readiness flow.`
      : `${scoreIntro} I can walk you through the next update that will improve your plan the most.`;
  }
  if (goal === "next_step") {
    return target
      ? `Let's focus on "${target.title}" next. Open that step and I'll guide what comes after.`
      : "Let's open your next readiness question and move one step forward.";
  }
  return "I can point you to the exact step in the app and keep your plan moving forward.";
}

function stripActionDataCollectionLanguage(text: string): string {
  return text
    .replace(/\bwho\s+(would|should|do)\s+you\s+(want|choose|designate)[^?.!]*[?.!]?/gi, "")
    .replace(/\bplease\s+share[^?.!]*[?.!]?/gi, "")
    .replace(/\blist\s+of\s+accounts[^?.!]*[?.!]?/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function listToSentence(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

function summarizeReportSummary(text: string | null): string | null {
  if (!text) return null;
  const firstSentence = text.split(/(?<=[.!?])\s+/).find((line) => line.trim().length > 0) || text;
  return firstSentence.trim().slice(0, 320);
}

export function applyConversationPolicy(params: {
  context: RemyChatContext;
  baseResponse: RemyChatTurnResponse;
  history: ChatHistoryItem[];
  stateRaw: unknown;
  capabilityContext?: RemyCapabilityContext | null;
}): RemyPlannerResult {
  const { context, baseResponse, history, stateRaw, capabilityContext } = params;
  const nowMs = Date.now();
  const state = normalizeConversationState(stateRaw, nowMs);
  state.turn_count += 1;

  const goal = classifyTurnGoal(context.message);
  const scoreBand = getScoreBand(context.assessment?.overall_score ?? null);
  const scoreIntro = scoreBandSummary(scoreBand, context.assessment?.overall_score);
  const priorities = context.payload.priorities;

  let target = firstEligiblePriority(priorities, state, nowMs, context.message);
  let alternatives: PriorityItem[] = [];

  if (goal === "skip_priority") {
    const currentTarget = findPriorityById(priorities, state.last_target_question_id) ?? priorities[0] ?? null;
    if (currentTarget) {
      const declinedUntil = new Date(nowMs + 24 * 60 * 60 * 1000).toISOString();
      state.declined_until_by_id[currentTarget.id] = declinedUntil;
      state.declined_priority_ids = Object.keys(state.declined_until_by_id);
    }
    target = firstEligiblePriority(priorities, state, nowMs, context.message);
    alternatives = priorities
      .filter((item) => item.id !== target?.id)
      .filter((item) => !isDeclined(item.id, state, nowMs))
      .slice(0, 2);
  } else {
    alternatives = priorities
      .filter((item) => item.id !== target?.id)
      .filter((item) => !isDeclined(item.id, state, nowMs))
      .slice(0, 2);
  }

  if (target && isDeclined(target.id, state, nowMs) && !isExplicitlyAskingForPriority(context.message, target)) {
    target = priorities.find((item) => !isDeclined(item.id, state, nowMs)) ?? target;
  }

  const explicitAction = ACTION_REQUEST_PATTERNS.some((pattern) => pattern.test(normalizeText(context.message)));
  const fallbackReplies = fallbackQuickReplies(baseResponse);
  const route = capabilityContext?.route ?? null;
  const completionTransition = isCompletionTransitionPrompt(context.message);
  const mentionedPriority = matchPriorityFromMessage(context.message, priorities);
  const asksAboutLegalScore = /\blegal\b/.test(normalizeText(context.message));

  let assistantMessage = stripActionDataCollectionLanguage(baseResponse.assistant_message);
  let cta = baseResponse.cta;
  let intent = baseResponse.intent;
  let repetitionGuardTriggered = false;
  let capability: RemyPlannerCapability | undefined;
  let routeType: string | undefined;
  let routeResolved = false;
  let ambiguityDetected = false;
  let reportSummaryMode: "summary" | "strengths" | undefined;
  let vaultDocTargeted: string | undefined;

  if (goal === "out_of_scope") {
    assistantMessage =
      "I can help only with Rest Easy readiness guidance. I can explain your score, suggest your next step, and route you to the right question in the app.";
    cta = undefined;
    intent = "unknown";
  } else if (goal === "greeting") {
    assistantMessage =
      "Hey, glad you're here. I can help you pick the right next step, explain your score, and route you exactly where you need to go.";
    cta = undefined;
    intent = "reassure";
  } else if (goal === "score_explain") {
    capability = "readiness";
    assistantMessage = target
      ? asksAboutLegalScore
        ? `${scoreIntro} Your legal readiness is lower mainly because "${target.title}" is still incomplete. I can walk you through your options and open it when you're ready.`
        : `${scoreIntro} The biggest factor right now is "${target.title}" being incomplete. I can walk you through options and open it when you're ready.`
      : `${scoreIntro} I can walk you through the most impactful step to improve it.`;
    cta = undefined;
    routeType = target ? "readiness_question" : undefined;
    routeResolved = Boolean(target);
    intent = "explain_score";
  } else if (goal === "next_step") {
    capability = "readiness";
    const completedTarget = completionTransition && mentionedPriority ? mentionedPriority : null;
    const nextStepTarget = completedTarget
      ? firstAlternativePriority(priorities, state, nowMs, completedTarget.id)
      : target;
    if (nextStepTarget) {
      assistantMessage =
        completedTarget
          ? `Great progress finishing "${completedTarget.title}". Next, focus on "${nextStepTarget.title}" to keep building momentum.`
          : `Based on your assessment, I'd focus on "${nextStepTarget.title}" first. It's a practical, high-impact step.`;
      cta = {
        id: nextStepTarget.id,
        label: "Show my next step",
        href: nextStepTarget.target_href,
      };
      routeType = "readiness_question";
      routeResolved = true;
      target = nextStepTarget;
    } else {
      assistantMessage = "Continue your readiness flow and I can guide the next best step right away.";
      cta = undefined;
    }
    intent = "plan_next";
  } else if (goal === "skip_priority") {
    capability = "readiness";
    if (target) {
      const alternativesLine = alternatives.length > 0
        ? ` Other options include ${alternatives.map((item) => `"${item.title}"`).join(" and ")}.`
        : "";
      assistantMessage =
        `No problem, we can skip that for now. Let's move to "${target.title}" instead.${alternativesLine}`;
      cta = {
        id: target.id,
        label: "Show my next step",
        href: target.target_href,
      };
      routeType = "readiness_question";
      routeResolved = true;
    } else {
      assistantMessage = "No problem, we can skip that item for now and revisit your next best step anytime.";
      cta = undefined;
    }
    intent = "plan_next";
  } else if (goal === "vault_progress") {
    capability = "vault";
    const vault = capabilityContext?.vault;
    if (vault) {
      const leadDoc = vault.missing_high_priority_docs[0];
      const progressLine = `Your EasyVault is ${vault.progress_percent}% complete (${vault.completed_count}/${vault.applicable_count} applicable documents).`;
      if (leadDoc) {
        assistantMessage =
          `${progressLine} A strong next upload is "${leadDoc.name}". I can take you straight to that document step.`;
        cta = {
          id: leadDoc.id,
          label: "Open EasyVault step",
          href: `/vault?doc=${encodeURIComponent(leadDoc.id)}&action=${
            leadDoc.input_method === "inline" ? "edit" : "upload"
          }`,
        };
        routeType = leadDoc.input_method === "inline" ? "vault_edit" : "vault_upload";
        routeResolved = true;
        vaultDocTargeted = leadDoc.id;
      } else {
        assistantMessage = `${progressLine} You're in good shape. You can still review EasyVault for optional updates.`;
        cta = { id: "vault", label: "Open EasyVault", href: "/vault" };
        routeType = "app_section";
        routeResolved = true;
      }
    } else {
      assistantMessage = "I can guide your EasyVault progress once I can load your document context.";
      cta = undefined;
    }
    intent = "clarify";
  } else if (goal === "vault_upload_route") {
    capability = "vault";
    if (route?.routeType === "vault_upload" || route?.routeType === "vault_edit") {
      routeType = route.routeType;
      routeResolved = true;
      ambiguityDetected = route.ambiguous;
      vaultDocTargeted = route.vaultDocTargeted;
      if (route.ambiguous && route.alternatives.length > 0) {
        assistantMessage =
          `I can route you there in EasyVault. Do you mean ${
            listToSentence(route.alternatives.map((item) => `"${item.label.replace(/^Open\\s+/, "")}"`))
          }?`;
        cta = undefined;
      } else {
        assistantMessage =
          "You can do that in EasyVault. I'll open the exact document step so you can upload or edit it directly in the app.";
        cta = { id: route.targetId, label: "Open EasyVault step", href: route.href };
      }
    } else {
      assistantMessage =
        "You can upload and manage that in EasyVault. Open EasyVault, choose the document, and I can guide your next step after you update it.";
      cta = { id: "vault", label: "Open EasyVault", href: "/vault" };
      routeType = "app_section";
      routeResolved = true;
    }
    intent = "clarify";
  } else if (goal === "report_summary") {
    capability = "report";
    reportSummaryMode = "summary";
    const report = capabilityContext?.report;
    if (!report?.available) {
      assistantMessage =
        "I don't have a generated readiness report yet. Complete your assessment and I can summarize what stands out right away.";
      cta = { id: "open-results", label: "Open report", href: "/results" };
      routeType = "app_section";
      routeResolved = true;
    } else {
      const summary = summarizeReportSummary(report.executive_summary);
      const action = report.action_items[0];
      assistantMessage = summary
        ? `${summary}${action ? ` A good next move is ${action}.` : ""}`
        : `Your report shows meaningful progress with clear next steps. ${
          action ? `A good next move is ${action}.` : "I can walk you through the top recommendation."
        }`;
      cta = { id: "open-results", label: "Open report", href: "/results" };
      routeType = "app_section";
      routeResolved = true;
    }
    intent = "clarify";
  } else if (goal === "report_strengths") {
    capability = "report";
    reportSummaryMode = "strengths";
    const report = capabilityContext?.report;
    if (!report?.available) {
      assistantMessage =
        "Once your report is generated, I can summarize exactly where you're doing well and why.";
      cta = { id: "open-results", label: "Open report", href: "/results" };
      routeType = "app_section";
      routeResolved = true;
    } else {
      const strengths = report.strengths.slice(0, 3);
      assistantMessage = strengths.length > 0
        ? `You're doing well in ${listToSentence(strengths)}. Keep those areas steady while we improve one remaining gap at a time.`
        : "You've built momentum across several sections. I can walk through your strongest areas and what to maintain next.";
      cta = { id: "open-results", label: "Open report", href: "/results" };
      routeType = "app_section";
      routeResolved = true;
    }
    intent = "clarify";
  } else if (goal === "ui_wayfinding") {
    capability = "navigation";
    if (route) {
      routeType = route.routeType;
      routeResolved = true;
      ambiguityDetected = route.ambiguous;
      vaultDocTargeted = route.vaultDocTargeted;
      if (route.ambiguous && route.alternatives.length > 0) {
        assistantMessage =
          `I can guide you there. Did you want ${
            listToSentence(route.alternatives.map((item) => `"${item.label.replace(/^Open\\s+/, "")}"`))
          }?`;
        cta = undefined;
      } else {
        const navTarget = findNavigationTargetById(route.targetId);
        if (navTarget) {
          assistantMessage = `${navTarget.purpose} I can open it for you now.`;
        } else {
          assistantMessage = "I can guide you to that section right now.";
        }
        cta = { id: route.targetId, label: route.label, href: route.href };
      }
    } else {
      assistantMessage =
        "I can guide you to Dashboard, Life Readiness, Readiness Report, EasyVault, or Profile. Tell me where you want to go.";
      cta = undefined;
    }
    intent = "clarify";
  } else if (goal === "question_lookup" || goal === "route_to_question") {
    capability = "readiness";
    const readinessRoute = route?.routeType === "readiness_question" ? route : null;
    if (readinessRoute) {
      routeType = readinessRoute.routeType;
      routeResolved = true;
      ambiguityDetected = readinessRoute.ambiguous;
      if (readinessRoute.ambiguous && readinessRoute.alternatives.length > 0) {
        assistantMessage =
          `I can route you to the right readiness question. Do you mean ${
            listToSentence(readinessRoute.alternatives.map((item) => `"${item.label}"`))
          }?`;
        cta = undefined;
      } else {
        assistantMessage =
          "Let's update this directly in your readiness flow so it saves to your plan immediately.";
        cta = {
          id: readinessRoute.targetId,
          label: "Update this question",
          href: readinessRoute.href,
        };
      }
      intent = "clarify";
    } else if (goal === "route_to_question") {
      const routing = asRouteMessage(null, target, "Update this question");
      assistantMessage = routing.text;
      cta = routing.cta;
      routeResolved = Boolean(routing.cta);
      routeType = routing.cta ? "readiness_question" : undefined;
      intent = "clarify";
    } else {
      const routing = asRouteMessage(null, target, "Update this question");
      assistantMessage = routing.text;
      cta = routing.cta;
      routeResolved = Boolean(routing.cta);
      routeType = routing.cta ? "readiness_question" : undefined;
      intent = "clarify";
    }
  } else {
    assistantMessage = target
      ? `I can guide you through "${target.title}" next, or route you to EasyVault or your report if that's what you need.`
      : "I can guide you to the exact question, report section, or EasyVault document step you want to work on.";
    cta = undefined;
    intent = "clarify";
  }

  if (isPersonalDataCollectionPrompt(baseResponse.assistant_message)) {
    const route = asRouteMessage(null, target, "Update this question");
    assistantMessage = route.text;
    cta = route.cta;
    intent = "clarify";
  }

  if (hasRepetition(assistantMessage, history)) {
    assistantMessage = fallbackRepetitionMessage(goal, scoreIntro, target);
    repetitionGuardTriggered = true;
  }

  const reassurance = maybeAppendReassurance(assistantMessage, state, goal);
  assistantMessage = reassurance.message;
  if (reassurance.used) {
    state.last_reassurance_turn = state.turn_count;
  }

  if (
    !explicitAction &&
    goal !== "route_to_question" &&
    goal !== "question_lookup" &&
    goal !== "next_step" &&
    goal !== "skip_priority" &&
    goal !== "vault_upload_route" &&
    goal !== "ui_wayfinding"
  ) {
    cta = undefined;
  }

  state.last_goal = goal;
  state.last_target_question_id = target?.id;
  state.last_capability = capability;
  state.last_route = cta?.href || route?.href || undefined;
  state.last_report_focus = reportSummaryMode;
  state.last_vault_doc_id = vaultDocTargeted;

  return {
    response: {
      ...baseResponse,
      assistant_message: assistantMessage,
      cta,
      intent,
      quick_replies: fallbackReplies,
    },
    state,
    goal,
    scoreBand,
    policyMode: "app_directed_only",
    repetitionGuardTriggered,
    capability,
    routeType,
    routeResolved,
    ambiguityDetected,
    vaultDocTargeted,
    reportSummaryMode,
    groundingPassed: routeResolved || !capability || capability === "report" || capability === "readiness",
  };
}
