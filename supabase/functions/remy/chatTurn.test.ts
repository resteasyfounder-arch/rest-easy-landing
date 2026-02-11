import { describe, expect, it } from "vitest";
import {
  buildDeterministicChatReply,
  buildOutOfDomainResponse,
  classifyIntent,
  isOutOfDomainMessage,
  normalizeChatTurnResponse,
  type RemyChatContext,
} from "./chatTurn.ts";

const baseContext: RemyChatContext = {
  conversationId: "00000000-0000-0000-0000-000000000001",
  assessmentKey: "readiness_v1",
  surface: "dashboard",
  message: "What should I do first?",
  assessment: {
    id: "a-1",
    status: "in_progress",
    report_status: "not_started",
    report_stale: false,
    report_data: null,
    last_answer_at: null,
    overall_score: 49,
  },
  payload: {
    surface: "dashboard",
    generated_at: new Date().toISOString(),
    domain_scope: "rest_easy_readiness",
    nudge: {
      id: "improve:q1",
      title: "Prioritize Legal Planning",
      body: "Improving this now has high impact.",
      cta: {
        label: "Do this now",
        href: "/readiness?section=legal",
      },
    },
    explanations: [
      {
        id: "exp:q1",
        title: "Why Legal Planning is prioritized",
        body: "Current answer is low confidence and this area is highly weighted.",
        source_refs: ["Section context (legal)", "Question response (q1)"],
      },
    ],
    priorities: [
      {
        id: "q1",
        title: "Do you currently have a legally valid will?",
        priority: "HIGH",
        why_now: "This section carries 25% weight.",
        target_href: "/readiness?section=legal&question=q1",
      },
    ],
    reassurance: {
      title: "You're on your way",
      body: "Most of the hard work is done and we can tackle one high-impact item next.",
    },
  },
  answerCount: 8,
};

describe("chatTurn classifier", () => {
  it("classifies score explanation intent", () => {
    expect(classifyIntent("Why is my score low right now?")).toBe("explain_score");
  });

  it("classifies prioritization intent", () => {
    expect(classifyIntent("What should I do first?")).toBe("prioritize");
  });

  it("flags out of domain prompts", () => {
    expect(isOutOfDomainMessage("What stocks should I buy?")).toBe(true);
    expect(isOutOfDomainMessage("How do I improve my readiness plan?")).toBe(false);
  });
});

describe("chatTurn fallback responses", () => {
  it("returns a boundary response for out-of-domain prompts", () => {
    const reply = buildOutOfDomainResponse({
      ...baseContext,
      message: "Who will win the election?",
    });

    expect(reply.safety_flags).toContain("domain_boundary");
    expect(reply.cta?.href).toBe("/readiness?section=legal");
  });

  it("returns prioritized guidance for in-domain prompts", () => {
    const reply = buildDeterministicChatReply(baseContext);
    expect(reply.intent).toBe("prioritize");
    expect(reply.assistant_message.toLowerCase()).toContain("start");
    expect(reply.assistant_message).not.toMatch(/\d+%/);
    expect(reply.assistant_message.toLowerCase()).not.toContain("weight");
    expect(reply.cta?.href).toBe("/readiness?section=legal");
  });
});

describe("chatTurn normalization", () => {
  it("rejects unsafe cta urls and keeps fallback cta", () => {
    const fallback = buildDeterministicChatReply(baseContext);
    const normalized = normalizeChatTurnResponse(
      {
        assistant_message: "Test reply",
        quick_replies: ["A", "B", "C", "D"],
        cta: {
          id: "bad",
          label: "Click me",
          href: "https://evil.com",
        },
        intent: "plan_next",
        confidence: 2,
      },
      fallback,
    );

    expect(normalized.cta?.href).toBe(fallback.cta?.href);
    expect(normalized.quick_replies).toHaveLength(3);
    expect(normalized.confidence).toBe(1);
  });

  it("rewrites backend transparency language into companion wording", () => {
    const fallback = buildDeterministicChatReply(baseContext);
    const normalized = normalizeChatTurnResponse(
      {
        assistant_message:
          "Current answer is \"No\". This section carries 25% weight. Use [Do this now](/readiness?section=1&question=1.1.B.3).",
        quick_replies: ["What should I do first?"],
        intent: "prioritize",
        confidence: 0.6,
      },
      fallback,
    );

    expect(normalized.assistant_message.toLowerCase()).not.toContain("current answer is");
    expect(normalized.assistant_message).not.toMatch(/\d+%/);
    expect(normalized.assistant_message.toLowerCase()).not.toContain("weight");
    expect(normalized.assistant_message.toLowerCase()).toContain("step");
  });
});
