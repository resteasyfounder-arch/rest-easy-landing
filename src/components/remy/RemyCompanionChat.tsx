import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, SendHorizonal, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  clearRemySessionsExcept,
  loadRemySession,
  saveRemySession,
} from "@/lib/remyChatSession";
import { cn } from "@/lib/utils";
import type {
  RemyChatTurnResponse,
  RemyConversationMessage,
  RemySurfacePayload,
} from "@/types/remy";

type ChatAction = {
  actionId: string;
  href: string;
  label: string;
};

type LocalReply = {
  text: string;
  actions?: ChatAction[];
  quickReplies?: string[];
};

type ChatFailureState = {
  text: string;
  source: "typed" | "quick_reply";
  retryable: boolean;
  traceId?: string;
  code?: string;
  message: string;
};

interface RemyCompanionChatProps {
  payload: RemySurfacePayload | null;
  isLoading?: boolean;
  error?: string | null;
  userName?: string | null;
  sessionKey?: string | null;
  uiV2Enabled?: boolean;
  onDismiss?: (nudgeId: string) => Promise<void> | void;
  onNavigateAction?: (actionId: string, href: string) => Promise<void> | void;
  onTrackEvent?: (eventId: string, metadata?: Record<string, unknown>) => Promise<void> | void;
  onChatTurn?: (
    message: string,
    conversationId?: string,
    contextHint?: string,
    clientTurnId?: string,
    clientRequestId?: string,
  ) => Promise<RemyChatTurnResponse>;
  onRetry?: () => Promise<void> | void;
  className?: string;
}

const DEFAULT_QUICK_REPLIES = [
  "What should I do first?",
  "Why is this prioritized?",
  "Can you explain my current score?",
];

const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

function buildIntroMessage(payload: RemySurfacePayload | null, userName?: string | null): RemyConversationMessage {
  const greeting = userName ? `Hi ${userName},` : "Hi,";
  if (!payload) {
    return {
      id: "remy:intro:empty",
      role: "remy",
      text: `${greeting} I can guide your next readiness step and keep things simple.`,
      createdAt: Date.now(),
      quickReplies: DEFAULT_QUICK_REPLIES,
    };
  }

  if (payload.nudge?.cta) {
    return {
      id: `remy:intro:${payload.nudge.id}`,
      role: "remy",
      text: `${greeting} here's a great next step: ${payload.nudge.title}.`,
      createdAt: Date.now(),
      actions: [{ actionId: payload.nudge.id, href: payload.nudge.cta.href, label: payload.nudge.cta.label }],
      quickReplies: DEFAULT_QUICK_REPLIES,
    };
  }

  return {
    id: "remy:intro:reassurance",
    role: "remy",
    text: `${greeting} ${payload.reassurance.body}`,
    createdAt: Date.now(),
    quickReplies: DEFAULT_QUICK_REPLIES,
  };
}

function buildLocalReply(input: string, payload: RemySurfacePayload | null): LocalReply {
  if (!payload) {
    return {
      text: "I need a little more context before I can personalize your next step. Continue your readiness flow and I’ll guide you from there.",
      quickReplies: DEFAULT_QUICK_REPLIES,
    };
  }

  const normalized = input.toLowerCase();
  const topPriority = payload.priorities[0];
  const topExplanation = payload.explanations[0];
  const topCta = payload.nudge?.cta || (topPriority
    ? {
      label: "Open top priority",
      href: topPriority.target_href,
    }
    : null);

  if (normalized.includes("score") || normalized.includes("why")) {
    return {
      text: topExplanation?.body || "Your top priorities reflect where focused action can move readiness forward fastest.",
      actions: topCta
        ? [{ actionId: payload.nudge?.id || topPriority?.id || "priority", href: topCta.href, label: topCta.label }]
        : undefined,
      quickReplies: DEFAULT_QUICK_REPLIES,
    };
  }

  if (normalized.includes("first") || normalized.includes("next") || normalized.includes("priority")) {
    return {
      text: topPriority
        ? `Start with "${topPriority.title}". This is a strong next step for your readiness progress.`
        : "Continue your readiness sections and I’ll reprioritize with your latest answers.",
      actions: topCta
        ? [{ actionId: payload.nudge?.id || topPriority?.id || "priority", href: topCta.href, label: topCta.label }]
        : undefined,
      quickReplies: DEFAULT_QUICK_REPLIES,
    };
  }

  return {
    text: payload.reassurance.body,
    actions: topCta
      ? [{ actionId: payload.nudge?.id || topPriority?.id || "priority", href: topCta.href, label: topCta.label }]
      : undefined,
    quickReplies: DEFAULT_QUICK_REPLIES,
  };
}

function toMessageAction(response?: RemyChatTurnResponse): ChatAction[] | undefined {
  if (!response?.cta) return undefined;
  return [{ actionId: response.cta.id, href: response.cta.href, label: response.cta.label }];
}

function buildClientRequestId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `req-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

function parseChatError(error: unknown): ChatFailureState {
  const fallback: ChatFailureState = {
    text: "",
    source: "typed",
    retryable: true,
    message: "I hit a temporary issue while responding. Please try again.",
  };

  if (!error || typeof error !== "object") return fallback;

  const candidate = error as {
    message?: string;
    code?: string;
    retryable?: boolean;
    traceId?: string;
  };

  return {
    ...fallback,
    message: candidate.message || fallback.message,
    code: candidate.code,
    retryable: typeof candidate.retryable === "boolean" ? candidate.retryable : true,
    traceId: candidate.traceId,
  };
}

export function RemyCompanionChat({
  payload,
  isLoading = false,
  error = null,
  userName = null,
  sessionKey = null,
  uiV2Enabled = true,
  onDismiss,
  onNavigateAction,
  onTrackEvent,
  onChatTurn,
  onRetry,
  className,
}: RemyCompanionChatProps) {
  const [messages, setMessages] = useState<RemyConversationMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [draft, setDraft] = useState("");
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [quickReplies, setQuickReplies] = useState<string[]>(DEFAULT_QUICK_REPLIES);
  const [lastFailure, setLastFailure] = useState<ChatFailureState | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const initializedRef = useRef(false);
  const isDebugMode = Boolean(import.meta.env.DEV);

  const canSend = useMemo(() => draft.trim().length > 0 && !isThinking, [draft, isThinking]);

  const track = (eventId: string, metadata: Record<string, unknown> = {}) => {
    if (!onTrackEvent) return;
    Promise.resolve(onTrackEvent(eventId, metadata)).catch(() => undefined);
  };

  useEffect(() => {
    if (uiV2Enabled && typeof window !== "undefined") {
      clearRemySessionsExcept(window.localStorage, sessionKey);
      if (sessionKey) {
        const restored = loadRemySession(window.localStorage, sessionKey, Date.now(), SESSION_TTL_MS);
        if (restored) {
          setMessages(restored.messages);
          setConversationId(restored.conversationId);
          setQuickReplies(restored.quickReplies.length > 0 ? restored.quickReplies : DEFAULT_QUICK_REPLIES);
          initializedRef.current = true;
          return;
        }
      }
    }

    const intro = buildIntroMessage(payload, userName);
    setMessages([intro]);
    setConversationId(undefined);
    setQuickReplies(intro.quickReplies || DEFAULT_QUICK_REPLIES);
    initializedRef.current = true;
  }, [sessionKey, uiV2Enabled]);

  useEffect(() => {
    if (!initializedRef.current) return;
    if (messages.length !== 1 || !messages[0]?.id.startsWith("remy:intro:")) return;
    const intro = buildIntroMessage(payload, userName);
    setMessages([intro]);
    setQuickReplies(intro.quickReplies || DEFAULT_QUICK_REPLIES);
  }, [payload, userName]);

  useEffect(() => {
    if (!uiV2Enabled || !sessionKey || typeof window === "undefined") return;
    if (messages.length === 0) return;
    saveRemySession(window.localStorage, sessionKey, {
      conversationId,
      messages,
      quickReplies,
      updatedAt: Date.now(),
    });
  }, [conversationId, messages, quickReplies, sessionKey, uiV2Enabled]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, [messages, isThinking]);

  const appendAssistantMessage = (message: RemyConversationMessage) => {
    setMessages((prev) => [...prev, message]);
    if (message.quickReplies && message.quickReplies.length > 0) {
      setQuickReplies(message.quickReplies.slice(0, 3));
    }
  };

  const sendMessage = async (rawText: string, source: "typed" | "quick_reply") => {
    const text = rawText.trim();
    if (!text || isThinking) return;

    const userMessageId = `user:${Date.now()}`;
    const clientRequestId = buildClientRequestId();
    const clientTurnId = `turn-${Date.now()}-${Math.random().toString(16).slice(2, 9)}`;

    setMessages((prev) => [
      ...prev,
      {
        id: userMessageId,
        role: "user",
        text,
        createdAt: Date.now(),
      },
    ]);
    setDraft("");
    setIsThinking(true);
    setLastFailure(null);
    track("remy_chat_turn", { source, has_chat_backend: Boolean(onChatTurn) });

    try {
      if (onChatTurn) {
        const response = await onChatTurn(
          text,
          conversationId,
          source === "quick_reply" ? "quick_reply" : undefined,
          clientTurnId,
          clientRequestId,
        );
        setConversationId(response.conversation_id);
        appendAssistantMessage({
          id: `remy:${Date.now()}`,
          role: "remy",
          text: response.assistant_message,
          createdAt: Date.now(),
          traceId: response.meta.trace_id,
          statusNote: !uiV2Enabled && response.meta.response_source === "deterministic_fallback"
            ? "Using backup guidance while live model service recovers."
            : undefined,
          actions: toMessageAction(response),
          quickReplies: response.quick_replies.length > 0 ? response.quick_replies : DEFAULT_QUICK_REPLIES,
        });
        if (response.meta.response_source === "deterministic_fallback") {
          track("remy_chat_fallback_notice", {
            source,
            trace_id: response.meta.trace_id,
            degraded_reason: response.meta.degraded_reason || null,
          });
        }
      } else {
        const fallback = buildLocalReply(text, payload);
        appendAssistantMessage({
          id: `remy:${Date.now()}`,
          role: "remy",
          text: fallback.text,
          createdAt: Date.now(),
          actions: fallback.actions,
          quickReplies: fallback.quickReplies || DEFAULT_QUICK_REPLIES,
        });
      }
    } catch (error) {
      const parsedError = parseChatError(error);
      appendAssistantMessage({
        id: `remy:error:${Date.now()}`,
        role: "remy",
        text: parsedError.message,
        createdAt: Date.now(),
        traceId: parsedError.traceId,
        statusNote: isDebugMode && parsedError.traceId ? `Trace: ${parsedError.traceId}` : undefined,
        quickReplies: DEFAULT_QUICK_REPLIES,
      });
      setMessages((prev) => prev.filter((message) => message.id !== userMessageId));
      if (source === "typed") {
        setDraft(text);
      }
      setLastFailure({
        ...parsedError,
        text,
        source,
      });
      track("remy_chat_error", {
        source,
        code: parsedError.code || "UNKNOWN",
        trace_id: parsedError.traceId || null,
      });
    } finally {
      setIsThinking(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage(draft, "typed");
  };

  const handleSuggestionClick = (value: string) => {
    if (!uiV2Enabled) {
      void sendMessage(value, "quick_reply");
      return;
    }
    setDraft(value.slice(0, 800));
    setLastFailure(null);
    track("remy_suggestion_selected", { suggestion: value });
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  if (isLoading) {
    return (
      <div className={cn("space-y-3", className)}>
        <p className="text-sm text-muted-foreground">Remy is preparing your guidance...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("space-y-3", className)}>
        <p className="text-sm text-muted-foreground">{error}</p>
        {onRetry && (
          <Button size="sm" variant="outline" onClick={onRetry}>
            Retry
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex h-full min-h-0 flex-col gap-3", className)}>
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 space-y-2 overflow-y-auto rounded-xl border border-border/50 bg-card/50 p-3"
      >
        {messages.slice(-20).map((message) => (
          <div key={message.id} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[92%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
                message.role === "user"
                  ? "rounded-br-md bg-primary/15 text-foreground"
                  : "rounded-bl-md border border-border/60 bg-background text-foreground",
              )}
            >
              {message.role === "remy" && (
                <div className="mb-1 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-primary">Remy</span>
                </div>
              )}
              <p>{message.text}</p>
              {message.statusNote && (
                <p className="mt-1 text-[11px] text-muted-foreground">{message.statusNote}</p>
              )}
              {message.actions && message.actions.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {message.actions.slice(0, 2).map((action) => (
                    <Button
                      key={`${message.id}:${action.actionId}`}
                      size="sm"
                      variant="outline"
                      className="h-7 gap-1.5 px-2.5 text-xs"
                      onClick={async () => {
                        track("remy_cta_clicked", {
                          action_id: action.actionId,
                          target_href: action.href,
                        });
                        if (onNavigateAction) {
                          await onNavigateAction(action.actionId, action.href);
                        }
                      }}
                    >
                      {action.label}
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-md border border-border/60 bg-background px-3 py-2">
              <p className="text-sm text-muted-foreground">Remy is typing...</p>
            </div>
          </div>
        )}
      </div>

      {lastFailure && (
        <div className="rounded-lg border border-amber-300/50 bg-amber-50/80 px-3 py-2 text-xs text-amber-900">
          <p>{lastFailure.message}</p>
          <div className="mt-1 flex items-center gap-2">
            {lastFailure.retryable && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2 text-xs"
                onClick={() => void sendMessage(lastFailure.text, lastFailure.source)}
                disabled={isThinking}
              >
                Retry send
              </Button>
            )}
            {isDebugMode && lastFailure.traceId && (
              <span className="text-[11px] text-amber-800/90">Trace {lastFailure.traceId}</span>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {quickReplies.slice(0, 3).map((item) => (
          <Button
            key={item}
            size="sm"
            variant="outline"
            className="h-8 px-3 text-xs"
            onClick={() => handleSuggestionClick(item)}
            disabled={isThinking && !uiV2Enabled}
          >
            {item}
          </Button>
        ))}
      </div>

      <form className="flex items-center gap-2" onSubmit={handleSubmit}>
        <Input
          ref={inputRef}
          value={draft}
          onChange={(event) => setDraft(event.target.value.slice(0, 800))}
          placeholder="Talk to Remy about your readiness plan..."
        />
        <Button type="submit" size="icon" disabled={!canSend} aria-label="Send message">
          <SendHorizonal className="h-4 w-4" />
        </Button>
      </form>

      {payload?.nudge && onDismiss && (
        <div className="flex items-center justify-between rounded-lg border border-border/50 bg-background/70 px-3 py-2">
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-foreground">{payload.nudge.title}</p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-xs"
            onClick={async () => {
              track("remy_nudge_dismissed", { nudge_id: payload.nudge?.id });
              await onDismiss(payload.nudge.id);
            }}
          >
            Not now
          </Button>
        </div>
      )}

      {payload?.priorities?.[0] && (
        <div className="flex items-center justify-between rounded-lg border border-border/50 bg-background/70 px-3 py-2">
          <p className="truncate pr-2 text-xs text-muted-foreground">{payload.priorities[0].title}</p>
          <Badge variant="secondary" className="text-[10px]">
            {payload.priorities[0].priority}
          </Badge>
        </div>
      )}
    </div>
  );
}

export default RemyCompanionChat;
