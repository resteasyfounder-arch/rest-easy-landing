import { getScoreBand, type RemyScoreBand } from "./decisionEngine.ts";
import type { RemyChatContext, RemyChatTurnResponse } from "./chatTurn.ts";

type PriorityItem = RemyChatContext["payload"]["priorities"][number];

type ChatHistoryItem = { role: "user" | "assistant"; text: string };

export type RemyTurnGoal =
  | "greeting"
  | "score_explain"
  | "next_step"
  | "skip_priority"
  | "route_to_question"
  | "clarification"
  | "out_of_scope";

export type RemyPlannerPolicyMode = "app_directed_only";

export type RemyConversationState = {
  declined_priority_ids: string[];
  declined_until_by_id: Record<string, string>;
  last_goal?: RemyTurnGoal;
  last_target_question_id?: string;
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

  return {
    declined_priority_ids: declinedPriorityIds,
    declined_until_by_id: declinedUntilMap,
    last_goal: safeLastGoal,
    last_target_question_id: lastTargetQuestionId,
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
  if (/\b(score|rating|grade|why\s+is\s+my\s+score|tell\s+me\s+about\s+my\s+score)\b/.test(normalized)) {
    return "score_explain";
  }
  if (/\b(skip|not\s+ready|don\s*t\s+want|do\s+not\s+want|other\s+options|something\s+else)\b/.test(normalized)) {
    return "skip_priority";
  }
  if (ACTION_REQUEST_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return "next_step";
  }
  if (
    /\b(update|change|edit|set\s*up|setting\s+up|beneficiar|trust|will|power\s+of\s+attorney|advance\s+directive)\b/
      .test(normalized)
  ) {
    return "route_to_question";
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
    : ["What should I do next?", "Explain my score", "Help me update a question"];
}

function shouldOfferReassurance(goal: RemyTurnGoal): boolean {
  return goal === "greeting" || goal === "clarification";
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
  scoreIntro: string,
  target: PriorityItem | null,
  fallbackLabel: string,
): { text: string; cta: RemyChatTurnResponse["cta"] | undefined } {
  if (!target) {
    return {
      text: `${scoreIntro} I can guide you to the exact readiness question you want to update. Tell me which topic you'd like to work on next.`,
      cta: undefined,
    };
  }

  return {
    text:
      `${scoreIntro} Let's update this directly in your readiness flow: "${target.title}". Open the question, make your update there, and I'll guide you on what to do next.`,
    cta: {
      id: target.id,
      label: fallbackLabel,
      href: target.target_href,
    },
  };
}

function fallbackRepetitionMessage(goal: RemyTurnGoal, scoreIntro: string, target: PriorityItem | null): string {
  if (goal === "score_explain") {
    return target
      ? `${scoreIntro} A practical next move is "${target.title}". Updating it in the app will improve your readiness plan clarity.`
      : `${scoreIntro} I can walk you through your next best update in the readiness flow.`;
  }
  if (goal === "next_step") {
    return target
      ? `${scoreIntro} Let's focus on "${target.title}" next. Open that question in the app so your plan updates immediately.`
      : `${scoreIntro} Let's open your next readiness question and move one step forward.`;
  }
  return `${scoreIntro} I can point you to the exact step in the app and keep your plan moving forward.`;
}

function stripActionDataCollectionLanguage(text: string): string {
  return text
    .replace(/\bwho\s+(would|should|do)\s+you\s+(want|choose|designate)[^?.!]*[?.!]?/gi, "")
    .replace(/\bplease\s+share[^?.!]*[?.!]?/gi, "")
    .replace(/\blist\s+of\s+accounts[^?.!]*[?.!]?/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function applyConversationPolicy(params: {
  context: RemyChatContext;
  baseResponse: RemyChatTurnResponse;
  history: ChatHistoryItem[];
  stateRaw: unknown;
}): RemyPlannerResult {
  const { context, baseResponse, history, stateRaw } = params;
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

  let assistantMessage = stripActionDataCollectionLanguage(baseResponse.assistant_message);
  let cta = baseResponse.cta;
  let intent = baseResponse.intent;
  let repetitionGuardTriggered = false;

  if (goal === "out_of_scope") {
    assistantMessage =
      "I can help only with Rest Easy readiness guidance. I can explain your score, suggest your next step, and route you to the right question in the app.";
    cta = undefined;
    intent = "unknown";
  } else if (goal === "greeting") {
    assistantMessage = `${scoreIntro} I can guide you to your best next readiness step whenever you're ready.`;
    cta = undefined;
    intent = "reassure";
  } else if (goal === "score_explain") {
    assistantMessage = target
      ? `${scoreIntro} A high-impact area to improve now is "${target.title}". I can point you to that question when you want to take action.`
      : `${scoreIntro} I can walk you through the most impactful step to improve it.`;
    cta = undefined;
    intent = "explain_score";
  } else if (goal === "next_step") {
    if (target) {
      assistantMessage =
        `${scoreIntro} A practical next step is "${target.title}". Open that question in your readiness flow to update it directly.`;
      cta = {
        id: target.id,
        label: "Show my next step",
        href: target.target_href,
      };
    } else {
      assistantMessage = `${scoreIntro} Continue your readiness flow and I will guide the next best step.`;
      cta = undefined;
    }
    intent = "plan_next";
  } else if (goal === "skip_priority") {
    if (target) {
      const alternativesLine = alternatives.length > 0
        ? ` Other options include ${alternatives.map((item) => `"${item.title}"`).join(" and ")}.`
        : "";
      assistantMessage =
        `${scoreIntro} No problem, we can skip that for now. Let's move to "${target.title}" instead.${alternativesLine}`;
      cta = {
        id: target.id,
        label: "Show my next step",
        href: target.target_href,
      };
    } else {
      assistantMessage = `${scoreIntro} No problem, we can skip that item for now and revisit your next best step anytime.`;
      cta = undefined;
    }
    intent = "plan_next";
  } else if (goal === "route_to_question") {
    const route = asRouteMessage(scoreIntro, target, "Update this question");
    assistantMessage = route.text;
    cta = route.cta;
    intent = "clarify";
  } else {
    assistantMessage = target
      ? `${scoreIntro} I can guide you through "${target.title}" next, then we can reassess your plan together.`
      : `${scoreIntro} I can guide you to the exact question to update next.`;
    cta = undefined;
    intent = "clarify";
  }

  if (isPersonalDataCollectionPrompt(baseResponse.assistant_message)) {
    const route = asRouteMessage(scoreIntro, target, "Update this question");
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

  if (!explicitAction && goal !== "route_to_question" && goal !== "next_step" && goal !== "skip_priority") {
    cta = undefined;
  }

  state.last_goal = goal;
  state.last_target_question_id = target?.id;

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
  };
}
