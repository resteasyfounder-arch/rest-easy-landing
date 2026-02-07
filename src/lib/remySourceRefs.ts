export function describeRemySourceRef(sourceRef: string): string {
  if (sourceRef.startsWith("section:")) {
    const sectionId = sourceRef.slice("section:".length);
    return `Section context (${sectionId})`;
  }

  if (sourceRef.startsWith("question:")) {
    const questionId = sourceRef.slice("question:".length);
    return `Question response (${questionId})`;
  }

  if (sourceRef.startsWith("assessment:report_status:")) {
    const status = sourceRef.slice("assessment:report_status:".length).replaceAll("_", " ");
    return `Report status (${status})`;
  }

  if (sourceRef === "assessment:report_stale") {
    return "Report freshness state";
  }

  if (sourceRef === "assessment:last_answer_at") {
    return "Most recent answer timestamp";
  }

  if (sourceRef.startsWith("assessment:")) {
    return `Assessment signal (${sourceRef.slice("assessment:".length).replaceAll("_", " ")})`;
  }

  return sourceRef.replaceAll("_", " ");
}
