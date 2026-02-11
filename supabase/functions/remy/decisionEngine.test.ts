import { describe, expect, it } from "vitest";
import {
  buildPriorityScore,
  buildReassurance,
  evaluateCondition,
  getScoreBand,
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

  it("maps readiness score bands objectively", () => {
    expect(getScoreBand(10)).toBe("early_readiness");
    expect(getScoreBand(54)).toBe("developing_readiness");
    expect(getScoreBand(72)).toBe("advancing_readiness");
    expect(getScoreBand(88)).toBe("near_full_readiness");
  });

  it("does not claim near full readiness for mid-range score", () => {
    const reassurance = buildReassurance(88, 7, 54, false);
    expect(reassurance.title).toBe("You're building readiness");
    expect(reassurance.title.toLowerCase()).not.toContain("near full");
  });

  it("requires both high score and strong progress for near-full framing", () => {
    expect(buildReassurance(90, 7, 85, false).title).toBe("You're near full readiness");
    expect(buildReassurance(60, 5, 85, false).title).toBe("You're advancing your readiness");
  });
});
