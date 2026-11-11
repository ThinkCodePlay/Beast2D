import { DISPLAY_HEIGHT, DISPLAY_WIDTH } from "../core/display";

/** Even light-pink margin around the console frame. */
export const CONSOLE_MARGIN = 16;

export const BOOT_DURATION_MS = 1500;

/**
 * Monogram is drawn at 16px × this integer.
 * 2× once the window is tall enough for the mockup's chunky chrome.
 */
export function chromeFontScale(viewportHeight: number): number {
  if (viewportHeight >= 640) return 2;
  return 1;
}

/** Largest integer scale of the 320×240 playfield that fits inside a panel. */
export function fitPreviewScale(
  panelWidth: number,
  panelHeight: number,
  designWidth = DISPLAY_WIDTH,
  designHeight = DISPLAY_HEIGHT,
): number {
  if (panelWidth <= 0 || panelHeight <= 0 || designWidth <= 0 || designHeight <= 0) return 1;
  const scale = Math.floor(Math.min(panelWidth / designWidth, panelHeight / designHeight));
  return Math.max(1, scale);
}
