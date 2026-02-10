import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { RemySurfacePayload } from "@/types/remy";

type Intent = "first_step" | "why_now" | "top_priorities" | "reassurance";

type ChatAction = {
  actionId: string;
  href: string;
  label: string;
};

type ChatMessage = {
  id: string;
  role: "user" | "remy";
  text: string;
  actions?: ChatAction[];
};

interface RemyCompanionChatProps {
  payload: RemySurfacePayload | null;
  isLoading?: boolean;
  error?: string | null;
  userName?: string | null;
  onDismiss?: (nudgeId: string) => Promise<void> | void;
  onNavigateAction?: (actionId: string, href: string) => Promise<void> | void;
  onTrackEvent?: (eventId: string, metadata?: Record<string, unknown>) => Promise<void> | void;
  onRetry?: () => Promise<void> | void;
  className?: string;
}

const QUICK_REPLIES: Array<{ id: Intent; label: string }> = [
  { id: "first_step", label: "What should I do first?" },
  { id: "why_now", label: "Why this now?" },
  { id: "top_priorities", label: "Show top priorities" },
  { id: "reassurance", label: "Reassure me" },
];

function getFirstMessage(payload: RemySurfacePayload | null, userName?: string | null): ChatMessage {
  const prefix = userName ? `Hi ${userName},` : "Hi,";
  if (!payload) {
    return {
      id: "intro:empty",
      role: "remy",
      text: `${prefix} I can guide your next readiness step and keep things simple.`,
    };
  }

  if (payload.nudge) {
    return {
      id: "intro:nudge",
      role: "remy",
      text: `${prefix} here's your highest-impact next step: ${payload.nudge.title}.`,
      actions: payload.nudge.cta
        ? [{ actionId: payload.nudge.id, href: payload.nudge.cta.href, label: payload.nudge.cta.label }]
        : undefined,
    };
  }

  return {
    id: "intro:reassurance",
    role: "remy",
    text: `${prefix} ${payload.reassurance.body}`,
  };
}

function getIntentReply(intent: Intent, payload: RemySurfacePayload | null): Omit<ChatMessage, "id" | "role"> {
  if (!payload) {
    return {
      text: "I need a little more profile and assessment context before I can personalize your next step.",
    };
  }

  switch (intent) {
    case "first_step": {
      if (payload.nudge?.cta) {
        return {
          text: payload.nudge.body,
          actions: [{ actionId: payload.nudge.id, href: payload.nudge.cta.href, label: payload.nudge.cta.label }],
        };
      }
      const top = payload.priorities[0];
      if (top) {
        return {
          text: `Start with "${top.title}". ${top.why_now}`,
          actions: [{ actionId: top.id, href: top.target_href, label: "Take me there" }],
        };
      }
      return {
        text: "You're in a good spot. Keep momentum by reviewing your report and finishing one remaining item this week.",
      };
    }
    case "why_now": {
      const explanation = payload.explanations[0];
      return {
        text: explanation?.body || "This recommendation is based on your current answers, section weight, and report state.",
      };
    }
    case "top_priorities": {
      if (payload.priorities.length === 0) {
        return {
          text: "You don't have critical priorities right now. Focus on consistency and keeping your details up to date.",
        };
      }
      const topTwo = payload.priorities.slice(0, 2);
      return {
        text: topTwo.map((item, index) => `${index + 1}. ${item.title}`).join(" "),
        actions: topTwo.map((item) => ({
          actionId: item.id,
          href: item.target_href,
          label: item.priority === "HIGH" ? `Open ${item.priority} priority` : `Open ${item.title}`,
        })),
      };
    }
    case "reassurance":
    default:
      return {
        text: payload.reassurance.body,
      };
  }
}

export function RemyCompanionChat({
  payload,
  isLoading = false,
  error = null,
  userName = null,
  onDismiss,
  onNavigateAction,
  onTrackEvent,
  onRetry,
  className,
}: RemyCompanionChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [lastTurnAt, setLastTurnAt] = useState<number>(Date.now());
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const quickReplies = useMemo(() => QUICK_REPLIES, []);

  const track = (eventId: string, metadata: Record<string, unknown> = {}) => {
    if (!onTrackEvent) return;
    Promise.resolve(onTrackEvent(eventId, metadata)).catch(() => undefined);
  };

  useEffect(() => {
    setMessages([getFirstMessage(payload, userName)]);
  }, [payload?.generated_at, userName]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, [messages, isThinking, lastTurnAt]);

  const handleIntent = (intent: Intent) => {
    if (isThinking) return;
    const prompt = quickReplies.find((item) => item.id === intent)?.label ?? "Tell me more";
    const nextUserMessage: ChatMessage = {
      id: `user:${Date.now()}`,
      role: "user",
      text: prompt,
    };
    setMessages((prev) => [...prev, nextUserMessage]);
    setIsThinking(true);
    setLastTurnAt(Date.now());

    track("remy_chat_turn", { intent });

    window.setTimeout(() => {
      const reply = getIntentReply(intent, payload);
      const nextAssistantMessage: ChatMessage = {
        id: `remy:${Date.now()}`,
        role: "remy",
        text: reply.text,
        actions: reply.actions,
      };
      setMessages((prev) => [...prev, nextAssistantMessage]);
      setIsThinking(false);
      setLastTurnAt(Date.now());
    }, 180);
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
    <div className={cn("space-y-3", className)}>
      <div
        ref={scrollRef}
        className="max-h-[min(55vh,360px)] space-y-2 overflow-y-auto rounded-xl border border-border/50 bg-card/50 p-3"
      >
        {messages.slice(-6).map((message) => (
          <div key={message.id} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[90%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
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
              {message.actions && message.actions.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {message.actions.slice(0, 2).map((action) => (
                    <Button
                      key={`${message.id}:${action.actionId}`}
                      size="sm"
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

      <div className="flex flex-wrap gap-2">
        {quickReplies.map((item) => (
          <Button
            key={item.id}
            size="sm"
            variant="outline"
            onClick={() => handleIntent(item.id)}
            disabled={isThinking}
          >
            {item.label}
          </Button>
        ))}
      </div>

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
