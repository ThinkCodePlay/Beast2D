import { TextureStyle } from "pixi.js";
import { DISPLAY_HEIGHT, DISPLAY_WIDTH } from "./display";

export interface DisplayScaleFitOptions {
  /** Inset from the window edges in CSS pixels (both axes). */
  padding?: number;
}

/**
 * Configure Pixi so loaded textures use nearest-neighbor sampling (no linear blur).
 * Call once before any `Assets.load` / texture creation.
 */
export function configurePixelArtRendering(): void {
  TextureStyle.defaultOptions.scaleMode = "nearest";
}

/**
 * Largest positive integer scale so the virtual framebuffer fits inside the padded
 * viewport while preserving aspect ratio. Never uses fractional scaling.
 *
 * When the viewport is smaller than one native frame (320×240 CSS px at 1×), returns
 * **1** — the game stays at logical resolution and may clip; center the frame or grow
 * the window instead of shrinking with non-integer CSS scale.
 */
export function computeIntegerDisplayScale(
  availWidth: number,
  availHeight: number,
  designWidth: number = DISPLAY_WIDTH,
  designHeight: number = DISPLAY_HEIGHT,
  padding = 0,
): number {
  if (designWidth <= 0 || designHeight <= 0) return 1;

  const innerW = Math.max(0, availWidth - padding * 2);
  const innerH = Math.max(0, availHeight - padding * 2);
  if (innerW <= 0 || innerH <= 0) return 1;

  const uniformFit = Math.min(innerW / designWidth, innerH / designHeight);
  const integerFit = Math.floor(uniformFit);
  return Math.max(1, integerFit);
}

export function displayCssSize(
  scale: number,
  designWidth: number = DISPLAY_WIDTH,
  designHeight: number = DISPLAY_HEIGHT,
): { width: number; height: number } {
  return {
    width: designWidth * scale,
    height: designHeight * scale,
  };
}

/**
 * Sizes `container` to an integer multiple of the virtual resolution and keeps it
 * updated on window resize. Does not change the Pixi backing-store size.
 */
export function attachDisplayScaleFit(
  container: HTMLElement,
  designWidth: number = DISPLAY_WIDTH,
  designHeight: number = DISPLAY_HEIGHT,
  options: DisplayScaleFitOptions = {},
): () => void {
  const padding = options.padding ?? 16;

  const apply = () => {
    const scale = computeIntegerDisplayScale(
      window.innerWidth,
      window.innerHeight,
      designWidth,
      designHeight,
      padding,
    );
    const { width, height } = displayCssSize(scale, designWidth, designHeight);
    container.style.width = `${width}px`;
    container.style.height = `${height}px`;
    container.dataset.displayScale = String(scale);
  };

  apply();
  window.addEventListener("resize", apply);
  return () => window.removeEventListener("resize", apply);
}
