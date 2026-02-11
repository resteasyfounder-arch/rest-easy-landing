import { describe, expect, it } from "vitest";
import { parseRemyChatTurnResponse } from "@/lib/remySchema";

describe("parseRemyChatTurnResponse", () => {
  it("parses a valid chat turn payload", () => {
    const parsed = parseRemyChatTurnResponse({
      conversation_id: "00000000-0000-0000-0000-000000000001",
      assistant_message: "Start with your legal planning section first.",
      quick_replies: ["Why this first?", "What is my score?"],
      cta: {
        id: "q1",
        label: "Open legal planning",
        href: "/readiness?section=legal",
      },
      why_this: {
        title: "Why this recommendation",
        body: "This item has higher weight and low confidence responses.",
        source_refs: ["section:legal", "question:q1"],
      },
      intent: "prioritize",
      confidence: 0.87,
      safety_flags: [],
      meta: {
        trace_id: "trace-123",
        response_source: "chat_completions",
      },
    });

    expect(parsed.intent).toBe("prioritize");
    expect(parsed.cta?.href).toBe("/readiness?section=legal");
  });

  it("rejects non-internal cta href", () => {
    expect(() =>
      parseRemyChatTurnResponse({
        conversation_id: "00000000-0000-0000-0000-000000000001",
        assistant_message: "Unsafe link",
        quick_replies: ["Try again"],
        cta: {
          id: "bad",
          label: "Bad",
          href: "https://example.com",
        },
        intent: "unknown",
        confidence: 0.5,
        safety_flags: [],
        meta: {
          trace_id: "trace-456",
          response_source: "deterministic_fallback",
        },
      })).toThrow();
  });

  it("parses additive planner metadata fields", () => {
    const parsed = parseRemyChatTurnResponse({
      conversation_id: "00000000-0000-0000-0000-000000000001",
      assistant_message: "Let's open your next step in the readiness flow.",
      quick_replies: ["Show my next step"],
      intent: "plan_next",
      confidence: 0.7,
      safety_flags: [],
      meta: {
        trace_id: "trace-789",
        response_source: "responses_api",
        goal: "next_step",
        score_band: "developing_readiness",
        policy_mode: "app_directed_only",
      },
    });

    expect(parsed.meta.goal).toBe("next_step");
    expect(parsed.meta.score_band).toBe("developing_readiness");
    expect(parsed.meta.policy_mode).toBe("app_directed_only");
  });

  it("parses additive capability-routing metadata fields", () => {
    const parsed = parseRemyChatTurnResponse({
      conversation_id: "00000000-0000-0000-0000-000000000001",
      assistant_message: "You can upload that in EasyVault and I can open the exact step.",
      quick_replies: ["Open EasyVault"],
      intent: "clarify",
      confidence: 0.8,
      safety_flags: [],
      meta: {
        trace_id: "trace-capability-1",
        response_source: "responses_api",
        goal: "vault_upload_route",
        capability: "vault",
        route_type: "vault_upload",
        grounding_passed: true,
      },
    });

    expect(parsed.meta.goal).toBe("vault_upload_route");
    expect(parsed.meta.capability).toBe("vault");
    expect(parsed.meta.route_type).toBe("vault_upload");
    expect(parsed.meta.grounding_passed).toBe(true);
  });
});
