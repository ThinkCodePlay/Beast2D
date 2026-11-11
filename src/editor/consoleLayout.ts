import { DISPLAY_HEIGHT, DISPLAY_WIDTH } from "../core/display";

/** Logical 1× console shell size (integer-scaled via CSS). */
export const CONSOLE_TOP_BAR = 16;
export const CONSOLE_DISK_ROW = 40;
export const CONSOLE_FOOTER = 16;
export const CONSOLE_PAD = 8;
export const CONSOLE_DIVIDER = 2;

/** Editor split: ~60% code, ~40% preview (320×240). */
export const CONSOLE_EDITOR_W = 480;
export const CONSOLE_PREVIEW_W = DISPLAY_WIDTH;
export const CONSOLE_WORK_H = DISPLAY_HEIGHT + CONSOLE_PAD * 2;

export const CONSOLE_WIDTH =
  CONSOLE_PAD * 2 + CONSOLE_EDITOR_W + CONSOLE_DIVIDER + CONSOLE_PREVIEW_W + CONSOLE_PAD;

export const CONSOLE_HEIGHT =
  CONSOLE_TOP_BAR + CONSOLE_DISK_ROW + CONSOLE_WORK_H + CONSOLE_FOOTER;

export const BOOT_DURATION_MS = 1500;
