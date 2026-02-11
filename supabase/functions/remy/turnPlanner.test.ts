import { describe, expect, it } from "vitest";
import { applyConversationPolicy, classifyTurnGoal, normalizeConversationState } from "./turnPlanner";
import type { RemyChatContext, RemyChatTurnResponse } from "./chatTurn";

const baseContext: RemyChatContext = {
  conversationId: "00000000-0000-0000-0000-000000000001",
  assessmentKey: "readiness_v1",
  surface: "dashboard",
  message: "What should I do next?",
  assessment: {
    id: "assessment-1",
    status: "in_progress",
    report_status: "ready",
    report_stale: false,
    report_data: null,
    last_answer_at: null,
    overall_score: 54,
  },
  payload: {
    surface: "dashboard",
    generated_at: new Date().toISOString(),
    domain_scope: "rest_easy_readiness",
    nudge: null,
    explanations: [],
    priorities: [
      {
        id: "1.1.B.3",
        title: "Do you have a revocable living trust?",
        priority: "HIGH",
        why_now: "This step has meaningful readiness impact right now.",
        target_href: "/readiness?section=1&question=1.1.B.3&returnTo=dashboard",
      },
      {
        id: "1.1.B.4",
        title: "Are beneficiaries set on all applicable accounts?",
        priority: "HIGH",
        why_now: "This step has meaningful readiness impact right now.",
        target_href: "/readiness?section=1&question=1.1.B.4&returnTo=dashboard",
      },
    ],
    reassurance: {
      title: "You're building readiness",
      body: "Targeting high-impact gaps will move your score.",
    },
  },
  answerCount: 10,
};

const baseResponse: RemyChatTurnResponse = {
  conversation_id: baseContext.conversationId,
  assistant_message: "Let's focus on your top priority.",
  quick_replies: ["What should I do next?"],
  intent: "plan_next",
  confidence: 0.9,
  safety_flags: [],
};

describe("turnPlanner classifier", () => {
  it("classifies goals from user prompts", () => {
    expect(classifyTurnGoal("hello")).toBe("greeting");
    expect(classifyTurnGoal("tell me about my score")).toBe("score_explain");
    expect(classifyTurnGoal("what should I do next")).toBe("next_step");
    expect(classifyTurnGoal("I don't want that step")).toBe("skip_priority");
  });
});

describe("turnPlanner policy enforcement", () => {
  it("frames score objectively for mid-band readiness", () => {
    const result = applyConversationPolicy({
      context: { ...baseContext, message: "Tell me about my score" },
      baseResponse,
      history: [],
      stateRaw: {},
    });

    expect(result.goal).toBe("score_explain");
    expect(result.scoreBand).toBe("developing_readiness");
    expect(result.response.assistant_message.toLowerCase()).toContain("54/100");
    expect(result.response.assistant_message.toLowerCase()).toContain("developing readiness");
    expect(result.response.assistant_message.toLowerCase()).not.toContain("near full");
  });

  it("rewrites personal data collection into app-directed guidance", () => {
    const result = applyConversationPolicy({
      context: { ...baseContext, message: "setting up beneficiaries" },
      baseResponse: {
        ...baseResponse,
        assistant_message: "Who would you like to designate as the beneficiary?",
      },
      history: [],
      stateRaw: {},
    });

    expect(result.response.assistant_message.toLowerCase()).toContain("update this directly in your readiness flow");
    expect(result.response.assistant_message.toLowerCase()).not.toContain("who would you like");
    expect(result.response.cta?.href).toContain("question=1.1.B.4");
  });

  it("stores skip memory and routes to an alternative priority", () => {
    const result = applyConversationPolicy({
      context: { ...baseContext, message: "I don't want to do that step" },
      baseResponse,
      history: [],
      stateRaw: {
        last_target_question_id: "1.1.B.3",
      },
    });

    expect(result.goal).toBe("skip_priority");
    expect(result.state.declined_priority_ids).toContain("1.1.B.3");
    expect(result.response.cta?.id).toBe("1.1.B.4");
  });

  it("normalizes stale/invalid conversation state inputs", () => {
    const state = normalizeConversationState({
      declined_until_by_id: {
        expired: "2020-01-01T00:00:00.000Z",
      },
      turn_count: -10,
      last_goal: "unknown_bad_value",
    });

    expect(state.declined_priority_ids).toEqual([]);
    expect(state.turn_count).toBe(0);
    expect(state.last_goal).toBeUndefined();
  });
});
