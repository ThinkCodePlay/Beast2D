/** Fixed logical game size — all levels and UI should use Globals / context sizes derived from this. */
export const DESIGN_WIDTH = 400;
export const DESIGN_HEIGHT = 300;

export interface ViewportFitOptions {
  /** Whole-number scale when enlarging (crisp pixel art); fractional scale when shrinking to fit. */
  integerScale?: boolean;
  /** Maximum uniform scale (optional). */
  maxScale?: number;
  /** Minimum inset from the window edges in CSS pixels. */
  padding?: number;
}

export function computeViewportScale(
  availWidth: number,
  availHeight: number,
  designWidth: number,
  designHeight: number,
  options: ViewportFitOptions = {},
): number {
  const { integerScale = false, maxScale } = options;

  if (designWidth <= 0 || designHeight <= 0) return 1;

  let scale = Math.min(availWidth / designWidth, availHeight / designHeight);
  if (integerScale && scale >= 1) {
    scale = Math.floor(scale);
  }
  if (maxScale !== undefined) {
    scale = Math.min(scale, maxScale);
  }
  return Math.max(scale, 0.05);
}

/**
 * Scales the game container to fit the browser window while keeping the engine's
 * logical resolution fixed. Does not call Engine.resize.
 */
export function fitGameViewport(
  container: HTMLElement,
  designWidth: number = DESIGN_WIDTH,
  designHeight: number = DESIGN_HEIGHT,
  options: ViewportFitOptions = {},
): () => void {
  const padding = options.padding ?? 16;

  const apply = () => {
    const scale = computeViewportScale(
      window.innerWidth - padding * 2,
      window.innerHeight - padding * 2,
      designWidth,
      designHeight,
      options,
    );

    container.style.width = `${designWidth * scale}px`;
    container.style.height = `${designHeight * scale}px`;
  };

  apply();
  window.addEventListener("resize", apply);
  return () => window.removeEventListener("resize", apply);
}
