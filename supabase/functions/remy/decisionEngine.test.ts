import { describe, expect, it } from "vitest";
import {
  buildPriorityScore,
  buildReassurance,
  evaluateCondition,
  getPriority,
} from "./decisionEngine";

describe("remy decision engine", () => {
  it("evaluates simple conditions against profile and answers", () => {
    const profile = { household_type: "family", has_pets: true };
    const answers = { q1: "yes", q2: "no" } as const;

    expect(evaluateCondition("always", profile, answers)).toBe(true);
    expect(evaluateCondition("profile.household_type == 'family'", profile, answers)).toBe(true);
    expect(evaluateCondition("answers.q2 == 'no'", profile, answers)).toBe(true);
    expect(evaluateCondition("answers.q2 in ['yes','partial']", profile, answers)).toBe(false);
  });

  it("fails closed for invalid condition expressions", () => {
    const result = evaluateCondition("answers.q1 ==", {}, {} as Record<string, never>);
    expect(result).toBe(false);
  });

  it("assigns priority tiers by score and section weight", () => {
    expect(getPriority(0.4, 20)).toBe("HIGH");
    expect(getPriority(0, 8)).toBe("MEDIUM");
    expect(getPriority(0.8, 12)).toBe("MEDIUM");
    expect(getPriority(0.8, 5)).toBe("LOW");
  });

  it("increases priority score for no/not_sure and stale reports", () => {
    const baseline = buildPriorityScore(0.5, 10, "partial", false);
    const noAnswer = buildPriorityScore(0.5, 10, "no", false);
    const notSure = buildPriorityScore(0.5, 10, "not_sure", false);
    const stale = buildPriorityScore(0.5, 10, "partial", true);

    expect(noAnswer).toBeGreaterThan(baseline);
    expect(notSure).toBeGreaterThan(baseline);
    expect(stale).toBeGreaterThan(baseline);
    expect(noAnswer).toBeGreaterThan(notSure);
  });

  it("returns reassurance copy for progress bands", () => {
    expect(buildReassurance(0, 0).title).toBe("You can start small");
    expect(buildReassurance(30, 1).title).toBe("Early progress matters");
    expect(buildReassurance(60, 4).title).toBe("You're building real coverage");
    expect(buildReassurance(90, 7).title).toBe("You're close to full readiness");
  });
});
