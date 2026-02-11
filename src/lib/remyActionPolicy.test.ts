import { describe, expect, it } from "vitest";
import {
  isExplicitActionRequest,
  isNextStepRequest,
  isQuestionUpdateRequest,
  normalizeActionLabel,
} from "./remyActionPolicy";

describe("remyActionPolicy", () => {
  it("detects explicit question-update intent", () => {
    expect(isQuestionUpdateRequest("help me update this question")).toBe(true);
    expect(isExplicitActionRequest("help me update this question")).toBe(true);
  });

  it("detects explicit next-step intent", () => {
    expect(isNextStepRequest("what should I do next?")).toBe(true);
    expect(isExplicitActionRequest("what should I do next?")).toBe(true);
  });

  it("does not mark informational prompts as explicit action intent", () => {
    expect(isExplicitActionRequest("why is my legal score low?")).toBe(false);
    expect(isExplicitActionRequest("am I on track?")).toBe(false);
  });

  it("normalizes CTA labels based on request intent", () => {
    expect(normalizeActionLabel("please update this question", "Do this now")).toBe("Update this question");
    expect(normalizeActionLabel("what should I do next?", "Do this now")).toBe("Show my next step");
    expect(normalizeActionLabel("tell me more", "Do this now")).toBe("Do this now");
  });
});
