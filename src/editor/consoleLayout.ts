import { DISPLAY_HEIGHT, DISPLAY_WIDTH } from "../core/display";

export const BOOT_DURATION_MS = 1500;

/** Set false to land on Home immediately (no boot overlay). */
export const BOOT_SCREEN_ENABLED = false;

/**
 * Monogram is drawn at 16px × this integer.
 * 2× once the window is tall enough for the mockup's chunky chrome.
 */
/** Integer UI scale for chrome. Narrow viewports step down so SFX + bank fit without clipping. */
export function chromeFontScale(
  viewportHeight: number,
  viewportWidth = 9999,
): number {
  let scale = viewportHeight >= 640 ? 2 : 1;
  if (viewportWidth < 1040) scale = 1;
  return scale;
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
  if (
    panelWidth <= 0 ||
    panelHeight <= 0 ||
    designWidth <= 0 ||
    designHeight <= 0
  )
    return 1;
  const scale = Math.floor(
    Math.min(panelWidth / designWidth, panelHeight / designHeight),
  );
  return Math.max(1, scale);
}
