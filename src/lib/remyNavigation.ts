const SAFE_DEFAULT_ROUTE = "/dashboard";

export function getSafeRemyPath(path: string | undefined | null, fallback = SAFE_DEFAULT_ROUTE): string {
  if (!path || typeof path !== "string") return fallback;
  if (!path.startsWith("/")) return fallback;
  if (path.startsWith("//")) return fallback;
  if (path.includes("://")) return fallback;
  if (/[\r\n]/.test(path)) return fallback;
  return path;
}
