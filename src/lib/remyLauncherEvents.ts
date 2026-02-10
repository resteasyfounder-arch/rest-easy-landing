export const REMY_OPEN_LAUNCHER_EVENT = "remy:open-launcher";

export function openRemyLauncher() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(REMY_OPEN_LAUNCHER_EVENT));
}
