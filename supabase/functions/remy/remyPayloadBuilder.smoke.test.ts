import { describe, expect, it } from "vitest";
import { buildRemySurfacePayload } from "./remyPayloadBuilder";
import type { AssessmentRow, Schema } from "./remyPayloadBuilder";

const baseSchema: Schema = {
  sections: [
    { id: "planning", label: "Planning", dimension: "readiness", weight: 20 },
    { id: "safety", label: "Safety", dimension: "readiness", weight: 10 },
  ],
  questions: [
    {
      id: "q_plan",
      section_id: "planning",
      prompt: "Do you have an emergency plan?",
      applies_if: "always",
      options: [
        { value: "yes", label: "Yes" },
        { value: "partial", label: "Somewhat" },
        { value: "no", label: "No" },
        { value: "not_sure", label: "Not sure" },
        { value: "na", label: "N/A" },
      ],
    },
    {
      id: "q_safe",
      section_id: "safety",
      prompt: "Do you have safety supplies ready?",
      applies_if: "always",
      options: [
        { value: "yes", label: "Yes" },
        { value: "partial", label: "Somewhat" },
        { value: "no", label: "No" },
        { value: "not_sure", label: "Not sure" },
        { value: "na", label: "N/A" },
      ],
    },
  ],
  answer_scoring: {
    yes: 1,
    partial: 0.5,
    no: 0,
    not_sure: 0,
    na: null,
  },
};

const baseAssessment: AssessmentRow = {
  id: "assessment-1",
  status: "in_progress",
  report_status: "not_started",
  report_stale: false,
  report_data: null,
  last_answer_at: null,
};

describe("remy payload smoke tests", () => {
  it("returns empty payload for new users with no assessment", () => {
    const payload = buildRemySurfacePayload({
      assessment: null,
      schema: null,
      profile: {},
      answers: [],
      dismissed: {},
      surface: "dashboard",
    });

    expect(payload.surface).toBe("dashboard");
    expect(payload.domain_scope).toBe("rest_easy_readiness");
    expect(payload.nudge).toBeNull();
    expect(payload.priorities).toHaveLength(0);
    expect(payload.explanations).toHaveLength(0);
  });

  it("returns in-progress nudge, priorities, and explanation", () => {
    const payload = buildRemySurfacePayload({
      assessment: baseAssessment,
      schema: baseSchema,
      profile: { household_type: "family" },
      answers: [
        {
          question_id: "q_plan",
          section_id: "planning",
          answer_value: "partial",
          answer_label: "Somewhat",
          score_fraction: 0.5,
          question_text: "Do you have an emergency plan?",
        },
      ],
      dismissed: {},
      surface: "dashboard",
    });

    expect(payload.nudge?.id).toBe("improve:q_plan");
    expect(payload.priorities[0]?.id).toBe("q_plan");
    expect(payload.explanations[0]?.id).toBe("exp:q_plan");
    expect(payload.reassurance.title).toBe("You're building real coverage");
  });

  it("returns report-ready nudge for completed ready state", () => {
    const payload = buildRemySurfacePayload({
      assessment: {
        ...baseAssessment,
        status: "completed",
        report_status: "ready",
      },
      schema: baseSchema,
      profile: {},
      answers: [
        {
          question_id: "q_plan",
          section_id: "planning",
          answer_value: "yes",
          answer_label: "Yes",
          score_fraction: 1,
          question_text: "Do you have an emergency plan?",
        },
        {
          question_id: "q_safe",
          section_id: "safety",
          answer_value: "yes",
          answer_label: "Yes",
          score_fraction: 1,
          question_text: "Do you have safety supplies ready?",
        },
      ],
      dismissed: {},
      surface: "results",
    });

    expect(payload.nudge?.id).toBe("report:ready");
    expect(payload.priorities).toHaveLength(0);
    expect(payload.reassurance.title).toBe("You're making strong progress");
  });

  it("returns stale-report guidance and stale explanation", () => {
    const payload = buildRemySurfacePayload({
      assessment: {
        ...baseAssessment,
        status: "completed",
        report_status: "ready",
        report_stale: true,
      },
      schema: baseSchema,
      profile: {},
      answers: [
        {
          question_id: "q_plan",
          section_id: "planning",
          answer_value: "yes",
          answer_label: "Yes",
          score_fraction: 1,
          question_text: "Do you have an emergency plan?",
        },
        {
          question_id: "q_safe",
          section_id: "safety",
          answer_value: "yes",
          answer_label: "Yes",
          score_fraction: 1,
          question_text: "Do you have safety supplies ready?",
        },
      ],
      dismissed: {},
      surface: "results",
    });

    expect(payload.nudge?.id).toBe("report:stale");
    expect(payload.explanations.some((item) => item.id === "exp:report-stale")).toBe(true);
  });

  it("returns profile-surface nudge with profile return target", () => {
    const payload = buildRemySurfacePayload({
      assessment: baseAssessment,
      schema: baseSchema,
      profile: {},
      answers: [
        {
          question_id: "q_plan",
          section_id: "planning",
          answer_value: "partial",
          answer_label: "Somewhat",
          score_fraction: 0.5,
          question_text: "Do you have an emergency plan?",
        },
      ],
      dismissed: {},
      surface: "profile",
    });

    expect(payload.nudge?.cta?.href.includes("returnTo=profile")).toBe(true);
  });

  it("returns menu-surface nudge with menu return target", () => {
    const payload = buildRemySurfacePayload({
      assessment: baseAssessment,
      schema: baseSchema,
      profile: {},
      answers: [
        {
          question_id: "q_plan",
          section_id: "planning",
          answer_value: "partial",
          answer_label: "Somewhat",
          score_fraction: 0.5,
          question_text: "Do you have an emergency plan?",
        },
      ],
      dismissed: {},
      surface: "menu",
    });

    expect(payload.nudge?.cta?.href.includes("returnTo=menu")).toBe(true);
  });
});
