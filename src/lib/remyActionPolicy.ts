export function isQuestionUpdateRequest(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    /\b(update|change|edit|fix|revise|correct)\b/.test(normalized) &&
    /\b(question|answer|response|section|profile)\b/.test(normalized)
  ) || /\bupdate this question\b/.test(normalized);
}

export function isNextStepRequest(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    /\b(next step|what should i do next|what should i do first|where do i start|start now|do this now)\b/.test(
      normalized,
    ) ||
    /\b(skip|other options|something else|different option)\b/.test(normalized) ||
    /\b(next|first|start)\b/.test(normalized) && /\b(step|action|move|do)\b/.test(normalized)
  );
}

export function isNavigationRequest(message: string): boolean {
  const normalized = message.toLowerCase();
  return /\b(open|take me|go to|navigate|show me|bring me)\b/.test(normalized);
}

export function isExplicitActionRequest(message: string): boolean {
  return isQuestionUpdateRequest(message) || isNextStepRequest(message) || isNavigationRequest(message);
}

export function normalizeActionLabel(message: string, fallbackLabel: string): string {
  if (isQuestionUpdateRequest(message)) return "Update this question";
  if (isNextStepRequest(message) || isNavigationRequest(message)) return "Show my next step";
  return fallbackLabel;
}
