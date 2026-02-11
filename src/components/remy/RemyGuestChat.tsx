import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, SendHorizonal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSafeRemyPath } from "@/lib/remyNavigation";
import { cn } from "@/lib/utils";

type GuestChatAction = {
  label: string;
  href: string;
};

type GuestChatMessage = {
  id: string;
  role: "user" | "remy";
  text: string;
  actions?: GuestChatAction[];
};

interface RemyGuestChatProps {
  className?: string;
  onNavigate?: () => void;
}

const QUICK_PROMPTS = [
  "What is Rest Easy?",
  "How does Findability work?",
  "What happens after I log in?",
  "How does Remy help me?",
];

function createReply(input: string): Omit<GuestChatMessage, "id" | "role"> {
  const normalized = input.trim().toLowerCase();

  if (normalized.includes("findability") || normalized.includes("assessment")) {
    return {
      text: "Findability is the fastest starting point. It gives you a snapshot of readiness gaps and recommends where to focus first.",
      actions: [
        { label: "Start Findability", href: "/assessment" },
        { label: "Sign up / Log in", href: "/login" },
      ],
    };
  }

  if (normalized.includes("log in") || normalized.includes("login") || normalized.includes("sign up")) {
    return {
      text: "Signing in unlocks progress tracking across profile, readiness, dashboard, and results so Remy can keep guidance aligned with your updates.",
      actions: [
        { label: "Sign up / Log in", href: "/login" },
        { label: "Take Findability first", href: "/assessment" },
      ],
    };
  }

  if (normalized.includes("how") && normalized.includes("help")) {
    return {
      text: "Remy keeps guidance inside the Rest Easy domain: clarify what to do next, explain why it matters, and point you to the highest-impact step.",
      actions: [
        { label: "See the process", href: "/" },
        { label: "Start assessment", href: "/assessment" },
      ],
    };
  }

  if (
    normalized.includes("what is") ||
    normalized.includes("purpose") ||
    normalized.includes("rest easy") ||
    normalized.includes("platform")
  ) {
    return {
      text: "Rest Easy helps you organize life-readiness decisions so your loved ones can act with confidence. It combines profile context, assessments, and guided next steps.",
      actions: [
        { label: "Take Findability Assessment", href: "/assessment" },
        { label: "Sign up / Log in", href: "/login" },
      ],
    };
  }

  return {
    text: "I can answer Rest Easy questions about the platform, the Findability Assessment, and getting started. Ask me what you want to do next.",
    actions: [
      { label: "Take Findability Assessment", href: "/assessment" },
      { label: "Sign up / Log in", href: "/login" },
    ],
  };
}

export function RemyGuestChat({ className, onNavigate }: RemyGuestChatProps) {
  const navigate = useNavigate();
  const [draft, setDraft] = useState("");
  const [isResponding, setIsResponding] = useState(false);
  const [messages, setMessages] = useState<GuestChatMessage[]>([
    {
      id: "welcome",
      role: "remy",
      text: "Hi, I'm Remy. Ask me about Rest Easy, Findability, or how to get started.",
      actions: [
        { label: "What is Rest Easy?", href: "/" },
        { label: "Take Findability", href: "/assessment" },
      ],
    },
  ]);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const responseTimerRef = useRef<number | null>(null);

  const canSend = useMemo(() => draft.trim().length > 0 && !isResponding, [draft, isResponding]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, isResponding]);

  useEffect(() => {
    return () => {
      if (responseTimerRef.current) {
        window.clearTimeout(responseTimerRef.current);
      }
    };
  }, []);

  const sendPrompt = (rawText: string) => {
    const text = rawText.trim();
    if (!text || isResponding) return;

    const userMessage: GuestChatMessage = {
      id: `user:${Date.now()}`,
      role: "user",
      text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setDraft("");
    setIsResponding(true);

    responseTimerRef.current = window.setTimeout(() => {
      const reply = createReply(text);
      const remyMessage: GuestChatMessage = {
        id: `remy:${Date.now()}`,
        role: "remy",
        text: reply.text,
        actions: reply.actions,
      };
      setMessages((prev) => [...prev, remyMessage]);
      setIsResponding(false);
    }, 220);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendPrompt(draft);
  };

  const applyPromptSuggestion = (value: string) => {
    setDraft(value.slice(0, 280));
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap gap-2">
        {QUICK_PROMPTS.map((prompt) => (
          <Button
            key={prompt}
            size="sm"
            variant="outline"
            onClick={() => applyPromptSuggestion(prompt)}
            disabled={isResponding}
          >
            {prompt}
          </Button>
        ))}
      </div>

      <div
        ref={scrollContainerRef}
        className="max-h-64 space-y-3 overflow-y-auto rounded-xl border border-border/60 bg-card/60 p-3"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
          >
            <div
              className={cn(
                "max-w-[88%] rounded-2xl px-3 py-2",
                message.role === "user"
                  ? "rounded-br-md bg-primary/15 text-foreground"
                  : "rounded-bl-md border border-border/60 bg-background text-foreground",
              )}
            >
              <p className="text-sm leading-relaxed">{message.text}</p>
              {message.role === "remy" && message.actions && message.actions.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {message.actions.map((action) => (
                    <Button
                      key={`${message.id}:${action.label}`}
                      size="sm"
                      className="h-7 gap-1.5 px-2.5 text-xs"
                      onClick={() => {
                        const safeTarget = getSafeRemyPath(action.href, "/");
                        if (onNavigate) onNavigate();
                        navigate(safeTarget);
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

        {isResponding && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-md border border-border/60 bg-background px-3 py-2">
              <p className="text-sm text-muted-foreground">Remy is typing...</p>
            </div>
          </div>
        )}
      </div>

      <form className="flex items-center gap-2" onSubmit={handleSubmit}>
        <Input
          ref={inputRef}
          value={draft}
          onChange={(event) => setDraft(event.target.value.slice(0, 280))}
          placeholder="Ask Remy about Rest Easy..."
        />
        <Button type="submit" size="icon" disabled={!canSend} aria-label="Send message">
          <SendHorizonal className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}

export default RemyGuestChat;
