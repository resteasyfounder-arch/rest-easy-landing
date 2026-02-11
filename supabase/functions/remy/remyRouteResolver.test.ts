import { describe, expect, it } from "vitest";
import {
  resolveNavigationRoute,
  resolveReadinessQuestionRoute,
  resolveRouteForMessage,
  resolveVaultRoute,
} from "./remyRouteResolver.ts";
import type { Schema } from "./remyPayloadBuilder.ts";

const schema: Schema = {
  sections: [
    { id: "1", label: "Legal Planning", dimension: "legal", weight: 25 },
    { id: "2", label: "Healthcare", dimension: "health", weight: 20 },
  ],
  questions: [
    {
      id: "1.1.B.4",
      section_id: "1",
      prompt: "Are beneficiaries set up on all applicable accounts?",
      options: [
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" },
      ],
    },
    {
      id: "1.1.B.3",
      section_id: "1",
      prompt: "Do you have a revocable living trust?",
      options: [
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" },
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

describe("remyRouteResolver", () => {
  it("resolves health directive upload intent into EasyVault deep link", () => {
    const route = resolveVaultRoute("I have a health directive to upload, where do I do that?");
    expect(route?.routeType).toBe("vault_upload");
    expect(route?.href).toContain("/vault?doc=healthcare-directive");
  });

  it("resolves shorthand readiness question lookup", () => {
    const route = resolveReadinessQuestionRoute("help me update beneficiaries", schema, "dashboard");
    expect(route?.routeType).toBe("readiness_question");
    expect(route?.targetId).toBe("1.1.B.4");
    expect(route?.href).toContain("question=1.1.B.4");
  });

  it("resolves wayfinding requests to section routes", () => {
    const route = resolveNavigationRoute("I'm lost, take me to my report");
    expect(route?.routeType).toBe("app_section");
    expect(route?.href).toBe("/results");
  });

  it("prioritizes vault route resolution over generic navigation", () => {
    const route = resolveRouteForMessage({
      message: "where can I upload my healthcare directive",
      schema,
      surface: "dashboard",
    });
    expect(route?.routeType).toBe("vault_upload");
    expect(route?.href).toContain("/vault?doc=healthcare-directive");
  });
});
