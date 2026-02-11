import { describe, expect, it } from "vitest";
import {
  clampCanaryPercent,
  computeBackoffDelayMs,
  mapFailureFromStatus,
  mapSchemaFailure,
  mapTimeoutFailure,
  shouldRetryStatus,
  shouldUseResponsesProvider,
} from "./providerUtils";

describe("providerUtils", () => {
  it("routes by provider mode and canary percent", () => {
    expect(shouldUseResponsesProvider("responses", 0, "subject-a")).toBe(true);
    expect(shouldUseResponsesProvider("chat_completions", 100, "subject-a")).toBe(false);
  });

  it("clamps canary percent", () => {
    expect(clampCanaryPercent(-10)).toBe(0);
    expect(clampCanaryPercent(120)).toBe(100);
    expect(clampCanaryPercent(12.4)).toBe(12);
  });

  it("identifies retryable statuses", () => {
    expect(shouldRetryStatus(429)).toBe(true);
    expect(shouldRetryStatus(503)).toBe(true);
    expect(shouldRetryStatus(401)).toBe(false);
  });

  it("builds bounded backoff delays", () => {
    const first = computeBackoffDelayMs(1, 100);
    const second = computeBackoffDelayMs(2, 100);
    expect(first).toBeGreaterThanOrEqual(100);
    expect(second).toBeGreaterThanOrEqual(200);
    expect(second).toBeLessThanOrEqual(2500);
  });

  it("maps provider failure codes by HTTP status", () => {
    expect(mapFailureFromStatus(401, "bad key").code).toBe("OPENAI_AUTH_ERROR");
    expect(mapFailureFromStatus(429, "rate limited").code).toBe("OPENAI_RATE_LIMIT");
    expect(mapFailureFromStatus(502, "gateway").code).toBe("OPENAI_SERVER_ERROR");
    expect(mapFailureFromStatus(422, "bad input").code).toBe("OPENAI_PROVIDER_ERROR");
  });

  it("maps timeout and schema failures", () => {
    expect(mapTimeoutFailure("timed out").code).toBe("OPENAI_TIMEOUT");
    expect(mapSchemaFailure("bad shape").code).toBe("OPENAI_SCHEMA_INVALID");
  });
});

