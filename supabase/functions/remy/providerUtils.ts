export type RemyProviderMode = "chat_completions" | "responses" | "hybrid";
export type RemyResponseSource = "chat_completions" | "responses_api" | "deterministic_fallback";

export type RemyFailureCode =
  | "OPENAI_AUTH_ERROR"
  | "OPENAI_RATE_LIMIT"
  | "OPENAI_SERVER_ERROR"
  | "OPENAI_TIMEOUT"
  | "OPENAI_SCHEMA_INVALID"
  | "OPENAI_PROVIDER_ERROR";

export type ProviderFailure = {
  code: RemyFailureCode;
  retryable: boolean;
  detail: string;
  httpStatus?: number;
};

export function sanitizeProviderMode(raw: string | undefined): RemyProviderMode {
  if (raw === "responses" || raw === "hybrid" || raw === "chat_completions") return raw;
  return "chat_completions";
}

export function clampCanaryPercent(raw: number): number {
  if (!Number.isFinite(raw)) return 0;
  return Math.max(0, Math.min(100, Math.round(raw)));
}

export function hashToPercent(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0) % 100;
}

export function shouldUseResponsesProvider(
  mode: RemyProviderMode,
  canaryPercent: number,
  key: string,
): boolean {
  if (mode === "responses") return true;
  if (mode === "chat_completions") return false;
  return hashToPercent(key) < clampCanaryPercent(canaryPercent);
}

export function shouldRetryStatus(status: number): boolean {
  return status === 429 || status >= 500;
}

export function computeBackoffDelayMs(
  attempt: number,
  baseDelayMs: number,
): number {
  const normalizedBase = Math.max(20, Math.round(baseDelayMs));
  const exponent = Math.max(0, attempt - 1);
  const exponential = normalizedBase * (2 ** exponent);
  const jitter = Math.floor(Math.random() * normalizedBase);
  return Math.min(2_500, exponential + jitter);
}

export function mapFailureFromStatus(status: number, detail: string): ProviderFailure {
  if (status === 401 || status === 403) {
    return {
      code: "OPENAI_AUTH_ERROR",
      retryable: false,
      detail,
      httpStatus: status,
    };
  }
  if (status === 429) {
    return {
      code: "OPENAI_RATE_LIMIT",
      retryable: true,
      detail,
      httpStatus: status,
    };
  }
  if (status >= 500) {
    return {
      code: "OPENAI_SERVER_ERROR",
      retryable: true,
      detail,
      httpStatus: status,
    };
  }
  return {
    code: "OPENAI_PROVIDER_ERROR",
    retryable: false,
    detail,
    httpStatus: status,
  };
}

export function mapTimeoutFailure(detail: string): ProviderFailure {
  return {
    code: "OPENAI_TIMEOUT",
    retryable: true,
    detail,
  };
}

export function mapSchemaFailure(detail: string): ProviderFailure {
  return {
    code: "OPENAI_SCHEMA_INVALID",
    retryable: false,
    detail,
  };
}

