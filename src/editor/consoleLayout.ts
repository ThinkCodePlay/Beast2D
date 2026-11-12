import { DISPLAY_HEIGHT, DISPLAY_WIDTH } from "../core/display";

/** Pink margin around the compact console. The device itself stays near the mockup frame. */
export const CONSOLE_MARGIN = 48;

/** Outer size of the plum device at the 1280-wide mockup, before the pink margin. */
export const CONSOLE_DEVICE_WIDTH = 1170;
export const CONSOLE_DEVICE_HEIGHT = 640;

export const BOOT_DURATION_MS = 1500;

/**
 * Monogram is drawn at 16px × this integer.
 * 2× once the window is tall enough for the mockup's chunky chrome.
 */
export function chromeFontScale(viewportHeight: number): number {
  if (viewportHeight >= 640) return 2;
  return 1;
}

/** Home disks use the same pixels as the tool row, one integer step larger. */
export function homeFloppyScale(chromeScale: number): number {
  return Math.max(1, Math.round(chromeScale)) + 1;
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
