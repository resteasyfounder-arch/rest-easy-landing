import type { AssessmentRow, RemySurfacePayload } from "./remyPayloadBuilder.ts";

export type RemyChatIntent =
  | "clarify"
  | "prioritize"
  | "explain_score"
  | "plan_next"
  | "reassure"
  | "unknown";

export type RemyChatTurnResponse = {
  conversation_id: string;
  assistant_message: string;
  quick_replies: string[];
  cta?: {
    id: string;
    label: string;
    href: string;
  };
  why_this?: {
    title: string;
    body: string;
    source_refs: string[];
  };
  intent: RemyChatIntent;
  confidence: number;
  safety_flags: string[];
};

export type RemyChatContext = {
  conversationId: string;
  assessmentKey: string;
  surface: string;
  message: string;
  assessment: AssessmentRow | null;
  payload: RemySurfacePayload;
  answerCount: number;
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

const TRANSPARENCY_LEAK_PATTERNS = [
  /\b\d{1,3}\s*%\b/i,
  /\bweight(ed|ing)?\b/i,
  /\bcurrent answer is\b/i,
  /\bsection\s*(id|=|:)\b/i,
  /\bquestion\s*(id|=|:)\b/i,
  /\bsource[_\s-]?ref(s)?\b/i,
  /\bsection=[^&\s]+/i,
  /\bquestion=[^&\s]+/i,
];

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function sanitizeMessage(value: unknown, maxLen: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, maxLen);
}

function stripLinkMarkup(text: string): string {
  return text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1");
}

function scrubTransparencyLanguage(text: string): string {
  return text
    .replace(/\bCurrent answer is\s+"[^"]+"\.?\s*/gi, "")
    .replace(/\bThis section carries\s+\d{1,3}\s*%?\s+weight\.?\s*/gi, "")
    .replace(/\bsection\s+weight\b/gi, "priority context")
    .replace(/\bhighly weighted\b/gi, "high-impact")
    .replace(/\bweighted\b/gi, "important")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function hasTransparencyLeak(text: string): boolean {
  return TRANSPARENCY_LEAK_PATTERNS.some((pattern) => pattern.test(text));
}

function buildCompanionRewrite(intent: RemyChatIntent, ctaLabel?: string): string {
  switch (intent) {
    case "prioritize":
      return ctaLabel
        ? `Let's start with one focused step: ${ctaLabel}. I can help you move through it with confidence.`
        : "Let's start with one focused step that moves your readiness forward right away.";
    case "explain_score":
      return "You're making progress. A few areas still need attention, and I can guide you through them one step at a time.";
    case "plan_next":
      return "Let's take one concrete next step now, then we can check what changed and choose the next best move.";
    case "reassure":
      return "You're not behind. We'll keep this simple and make steady progress together.";
    case "clarify":
      return "I can explain what matters most right now and guide you to the next step in plain language.";
    case "unknown":
    default:
      return "I can help you pick the next best readiness step and keep the process clear and manageable.";
  }
}

export function enforceConversationalStyle(response: RemyChatTurnResponse): RemyChatTurnResponse {
  const cleanedMessage = scrubTransparencyLanguage(stripLinkMarkup(response.assistant_message));
  const looksFragmented = cleanedMessage.length < 24 || /^use\s+/i.test(cleanedMessage);
  const assistantMessage = cleanedMessage && !hasTransparencyLeak(cleanedMessage) && !looksFragmented
    ? cleanedMessage
    : buildCompanionRewrite(response.intent, response.cta?.label);

  const whyThis = response.why_this
    ? {
      ...response.why_this,
      body: (() => {
        const cleaned = scrubTransparencyLanguage(stripLinkMarkup(response.why_this!.body));
        return cleaned && !hasTransparencyLeak(cleaned)
          ? cleaned
          : "This step can meaningfully strengthen your readiness progress.";
      })(),
    }
    : undefined;

  const quickReplies = response.quick_replies
    .map((reply) => scrubTransparencyLanguage(stripLinkMarkup(reply)))
    .filter((reply) => reply && !hasTransparencyLeak(reply));

  return {
    ...response,
    assistant_message: assistantMessage,
    quick_replies: quickReplies.length > 0 ? quickReplies.slice(0, 3) : makeQuickReplies(),
    why_this: whyThis,
  };
}

export function sanitizeInternalPath(path: string | undefined | null): string | null {
  if (!path || typeof path !== "string") return null;
  if (!path.startsWith("/")) return null;
  if (path.startsWith("//")) return null;
  if (path.includes("://")) return null;
  if (/[\r\n]/.test(path)) return null;
  return path.slice(0, 512);
}

export function isOutOfDomainMessage(message: string): boolean {
  const normalized = message.trim();
  if (!normalized) return false;
  return OUT_OF_DOMAIN_PATTERNS.some((pattern) => pattern.test(normalized));
}

export function classifyIntent(message: string): RemyChatIntent {
  const normalized = message.toLowerCase();

  if (
    /\b(score|rating|grade|why .*low|why .*high|why is .* low|improve .*score)\b/.test(
      normalized,
    )
  ) {
    return "explain_score";
  }
  if (/\b(first|next|what should i do|where do i start|start with|do now|priority)\b/.test(normalized)) {
    return "prioritize";
  }
  if (/\b(plan|roadmap|step by step|how do i|what now|next step)\b/.test(normalized)) {
    return "plan_next";
  }
  if (/\b(reassure|anxious|worried|overwhelmed|behind|okay|ok)\b/.test(normalized)) {
    return "reassure";
  }
  if (/\b(what is|how does|explain|clarify|meaning)\b/.test(normalized)) {
    return "clarify";
  }
  return "unknown";
}

function makeQuickReplies(): string[] {
  return [
    "What should I do first?",
    "Why is this prioritized?",
    "Can you explain my current score?",
  ];
}

function buildFallbackCta(context: RemyChatContext): RemyChatTurnResponse["cta"] | undefined {
  if (context.payload.nudge?.cta?.href) {
    return {
      id: context.payload.nudge.id,
      label: context.payload.nudge.cta.label,
      href: context.payload.nudge.cta.href,
    };
  }
  const firstPriority = context.payload.priorities[0];
  if (!firstPriority) return undefined;
  return {
    id: firstPriority.id,
    label: "Open top priority",
    href: firstPriority.target_href,
  };
}

export function buildOutOfDomainResponse(context: RemyChatContext): RemyChatTurnResponse {
  return {
    conversation_id: context.conversationId,
    assistant_message:
      "I can only help with Rest Easy readiness guidance. I can explain your assessment status, prioritize next steps, and guide profile or report actions.",
    quick_replies: [
      "What should I do first?",
      "Explain my top priority",
      "Guide me to my next step",
    ],
    cta: buildFallbackCta(context),
    intent: "unknown",
    confidence: 0.95,
    safety_flags: ["domain_boundary"],
  };
}

function composeContextLine(context: RemyChatContext): string {
  const topPriority = context.payload.priorities[0]?.title ?? "No critical priorities currently";
  return `Top focus right now: ${topPriority}.`;
}

export function buildDeterministicChatReply(context: RemyChatContext): RemyChatTurnResponse {
  if (isOutOfDomainMessage(context.message)) {
    return buildOutOfDomainResponse(context);
  }

  const intent = classifyIntent(context.message);
  const cta = buildFallbackCta(context);
  const topPriority = context.payload.priorities[0];
  const topExplanation = context.payload.explanations[0];
  const reassurance = context.payload.reassurance.body;
  const contextLine = composeContextLine(context);
  let response: RemyChatTurnResponse;

  switch (intent) {
    case "prioritize":
      response = {
        conversation_id: context.conversationId,
        assistant_message: topPriority
          ? `Start with "${topPriority.title}". It is a strong next step to move your readiness forward.`
          : `Your best next move is to continue your readiness flow so I can personalize the next step with more confidence. ${contextLine}`,
        quick_replies: makeQuickReplies(),
        cta,
        why_this: topExplanation
          ? {
            title: topExplanation.title,
            body: topExplanation.body,
            source_refs: topExplanation.source_refs.slice(0, 4),
          }
          : undefined,
        intent,
        confidence: 0.82,
        safety_flags: [],
      };
      break;
    case "explain_score":
      response = {
        conversation_id: context.conversationId,
        assistant_message:
          `You are making progress. ${topExplanation?.body ?? "A few important areas still need attention, and we can tackle them one at a time."}`,
        quick_replies: makeQuickReplies(),
        cta,
        why_this: topExplanation
          ? {
            title: topExplanation.title,
            body: topExplanation.body,
            source_refs: topExplanation.source_refs.slice(0, 4),
          }
          : undefined,
        intent,
        confidence: 0.85,
        safety_flags: [],
      };
      break;
    case "plan_next":
      response = {
        conversation_id: context.conversationId,
        assistant_message: cta
          ? "Let's take one concrete step now. I can guide you through it and then we’ll reassess together."
          : "Let’s keep momentum. Continue your readiness flow and I’ll guide the next best move.",
        quick_replies: makeQuickReplies(),
        cta,
        intent,
        confidence: 0.8,
        safety_flags: [],
      };
      break;
    case "reassure":
      response = {
        conversation_id: context.conversationId,
        assistant_message: reassurance,
        quick_replies: makeQuickReplies(),
        cta,
        intent,
        confidence: 0.86,
        safety_flags: [],
      };
      break;
    case "clarify":
      response = {
        conversation_id: context.conversationId,
        assistant_message:
          `Remy keeps your readiness plan clear: explain what matters, guide your next step, and stay aligned to your latest updates. ${contextLine}`,
        quick_replies: makeQuickReplies(),
        cta,
        intent,
        confidence: 0.78,
        safety_flags: [],
      };
      break;
    case "unknown":
    default:
      response = {
        conversation_id: context.conversationId,
        assistant_message:
          `I can help you choose the next best readiness step and keep it simple. ${contextLine} Ask me what to do first or what to focus on next.`,
        quick_replies: makeQuickReplies(),
        cta,
        intent: "unknown",
        confidence: 0.72,
        safety_flags: [],
      };
  }

  return enforceConversationalStyle(response);
}

export function normalizeChatTurnResponse(
  raw: unknown,
  fallback: RemyChatTurnResponse,
): RemyChatTurnResponse {
  if (!raw || typeof raw !== "object") return fallback;
  const candidate = raw as Record<string, unknown>;

  const intent = typeof candidate.intent === "string" ? candidate.intent : fallback.intent;
  const safeIntent: RemyChatIntent = (
    intent === "clarify" ||
      intent === "prioritize" ||
      intent === "explain_score" ||
      intent === "plan_next" ||
      intent === "reassure" ||
      intent === "unknown"
  )
    ? intent
    : fallback.intent;

  const assistantMessage = sanitizeMessage(candidate.assistant_message, 1600) || fallback.assistant_message;
  const confidence = typeof candidate.confidence === "number"
    ? clamp(candidate.confidence, 0, 1)
    : fallback.confidence;

  const quickReplies = Array.isArray(candidate.quick_replies)
    ? candidate.quick_replies
      .slice(0, 3)
      .map((value) => sanitizeMessage(value, 100))
      .filter((value) => Boolean(value))
    : fallback.quick_replies;

  let cta = fallback.cta;
  if (candidate.cta && typeof candidate.cta === "object") {
    const ctaCandidate = candidate.cta as Record<string, unknown>;
    const href = sanitizeInternalPath(typeof ctaCandidate.href === "string" ? ctaCandidate.href : "");
    const id = sanitizeMessage(ctaCandidate.id, 120);
    const label = sanitizeMessage(ctaCandidate.label, 90);
    if (href && id && label) {
      cta = { id, label, href };
    }
  }

  let whyThis = fallback.why_this;
  if (candidate.why_this && typeof candidate.why_this === "object") {
    const whyCandidate = candidate.why_this as Record<string, unknown>;
    const title = sanitizeMessage(whyCandidate.title, 140);
    const body = sanitizeMessage(whyCandidate.body, 600);
    const sourceRefs = Array.isArray(whyCandidate.source_refs)
      ? whyCandidate.source_refs
        .slice(0, 5)
        .map((value) => sanitizeMessage(value, 120))
        .filter((value) => Boolean(value))
      : [];
    if (title && body) {
      whyThis = { title, body, source_refs: sourceRefs };
    }
  }

  const safetyFlags = Array.isArray(candidate.safety_flags)
    ? candidate.safety_flags
      .slice(0, 8)
      .map((value) => sanitizeMessage(value, 80))
      .filter((value) => Boolean(value))
    : fallback.safety_flags;

  return enforceConversationalStyle({
    conversation_id: fallback.conversation_id,
    assistant_message: assistantMessage,
    quick_replies: quickReplies.length > 0 ? quickReplies : fallback.quick_replies,
    cta,
    why_this: whyThis,
    intent: safeIntent,
    confidence,
    safety_flags: safetyFlags,
  });
}

export function buildModelSystemPrompt(): string {
  return [
    "You are Remy, the Rest Easy companion.",
    "Only provide guidance within Rest Easy readiness planning.",
    "Do not provide legal, financial, medical, or political advice.",
    "Never invent user data. If uncertain, say what is unknown.",
    "Tone: calm, supportive, concise, direct.",
    "Focus on one practical next step per response.",
    "Do not expose internal analytics or backend details (no percentages, weights, section IDs, question IDs, source refs, or raw assessment keys).",
    "Do not use phrases like 'current answer is' or mention schema/report internals.",
    "Return JSON only that matches the remy_chat_turn function schema.",
  ].join(" ");
}

function summarizeProgressState(score: number | null | undefined): string {
  if (typeof score !== "number") return "progress_not_ready";
  if (score >= 75) return "strong_progress";
  if (score >= 45) return "building_momentum";
  return "early_progress";
}

function modelSafeReason(reason: string): string {
  const cleaned = scrubTransparencyLanguage(stripLinkMarkup(reason));
  if (!cleaned || hasTransparencyLeak(cleaned)) {
    return "This step has meaningful readiness impact right now.";
  }
  return cleaned;
}

export function buildModelUserPrompt(
  context: RemyChatContext,
  history: Array<{ role: "user" | "assistant"; text: string }>,
): string {
  const serializedHistory = history
    .slice(-8)
    .map((item) => `${item.role === "assistant" ? "Remy" : "User"}: ${modelSafeReason(item.text)}`)
    .join("\n");

  const topPriorities = context.payload.priorities.slice(0, 3).map((item) => ({
    title: item.title,
    reason: modelSafeReason(item.why_now),
  }));

  const input = {
    surface: context.surface,
    assessment_status: context.assessment?.status ?? "unknown",
    report_status: context.assessment?.report_status ?? "unknown",
    progress_state: summarizeProgressState(context.assessment?.overall_score),
    top_priorities: topPriorities,
    reassurance: context.payload.reassurance,
    nudge: context.payload.nudge
      ? {
        title: context.payload.nudge.title,
        body: modelSafeReason(context.payload.nudge.body),
        cta_label: context.payload.nudge.cta?.label ?? null,
      }
      : null,
    explanations: context.payload.explanations.slice(0, 2).map((item) => ({
      title: item.title,
      body: modelSafeReason(item.body),
    })),
    answer_count: context.answerCount,
    latest_user_message: modelSafeReason(context.message),
    conversation_history: serializedHistory,
  };

  return `Generate one helpful Remy reply from this context:\n${JSON.stringify(input)}`;
}
