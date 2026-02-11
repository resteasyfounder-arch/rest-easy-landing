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
    expect(classifyTurnGoal("where can I upload my health directive")).toBe("vault_upload_route");
    expect(classifyTurnGoal("summarize my report")).toBe("report_summary");
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

  it("builds report strengths guidance from grounded capability context", () => {
    const result = applyConversationPolicy({
      context: { ...baseContext, message: "where am I doing well?" },
      baseResponse,
      history: [],
      stateRaw: {},
      capabilityContext: {
        vault: {
          completed_count: 1,
          applicable_count: 10,
          progress_percent: 10,
          missing_high_priority_docs: [],
        },
        report: {
          available: true,
          stale: false,
          executive_summary: "Your readiness is improving with focused updates.",
          strengths: ["Legal planning", "Healthcare directives"],
          attention_areas: [],
          action_items: [],
        },
        navigation: { section_purposes: [] },
        route: null,
      },
    });

    expect(result.goal).toBe("report_strengths");
    expect(result.capability).toBe("report");
    expect(result.response.assistant_message.toLowerCase()).toContain("doing well");
    expect(result.reportSummaryMode).toBe("strengths");
  });

  it("returns vault deep-link guidance for upload intents", () => {
    const result = applyConversationPolicy({
      context: { ...baseContext, message: "where can I upload my health directive?" },
      baseResponse,
      history: [],
      stateRaw: {},
      capabilityContext: {
        vault: {
          completed_count: 2,
          applicable_count: 20,
          progress_percent: 10,
          missing_high_priority_docs: [
            {
              id: "healthcare-directive",
              name: "Healthcare Directive",
              category: "healthcare",
              input_method: "upload",
            },
          ],
        },
        report: {
          available: false,
          stale: false,
          executive_summary: null,
          strengths: [],
          attention_areas: [],
          action_items: [],
        },
        navigation: { section_purposes: [] },
        route: {
          routeType: "vault_upload",
          href: "/vault?doc=healthcare-directive&action=upload",
          label: "Open Healthcare Directive",
          targetId: "healthcare-directive",
          confidence: 0.9,
          ambiguous: false,
          alternatives: [],
          vaultDocTargeted: "healthcare-directive",
        },
      },
    });

    expect(result.goal).toBe("vault_upload_route");
    expect(result.routeType).toBe("vault_upload");
    expect(result.response.cta?.href).toBe("/vault?doc=healthcare-directive&action=upload");
    expect(result.vaultDocTargeted).toBe("healthcare-directive");
  });
});
