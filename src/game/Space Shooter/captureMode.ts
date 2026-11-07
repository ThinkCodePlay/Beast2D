/** Query helpers for deterministic screenshot / preview URLs (`?capture=shooter&scene=...`). */
export type ShooterCaptureScene = "title" | "gameplay" | "gameover";

export function getShooterCaptureScene(): ShooterCaptureScene | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  if (params.get("capture") !== "shooter") return null;
  const scene = params.get("scene") ?? "title";
  if (scene === "title" || scene === "gameplay" || scene === "gameover") {
    return scene;
  }
  return "title";
}
