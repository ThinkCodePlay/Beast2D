import { DISPLAY_WIDTH } from "../consts";
import { BITMAP_FONT } from "./fontGlyphs";
import { estimateBitmapTextWidth } from "./BitmapText";

/** Top HUD strip per `docs/display.md`. */
export const HUD_HEIGHT = 16;
export const HUD_PADDING = 4;
export const HUD_LETTER_SPACING = 0;
export const HUD_TEXT_SCALE = 1;

export function hudTextY(): number {
  return Math.floor((HUD_HEIGHT - BITMAP_FONT.glyphH * HUD_TEXT_SCALE) / 2);
}

export function hudScoreAnchorX(): number {
  return DISPLAY_WIDTH - HUD_PADDING;
}

export function hudLivesAnchorX(): number {
  return HUD_PADDING;
}

export function formatHudScore(score: number, label = "SCORE"): string {
  return `${label} ${Math.max(0, Math.floor(score))}`;
}

export function formatHudLives(lives: number): string {
  return `LIVES ${Math.max(0, Math.floor(lives))}`;
}

export function hudScoreTextWidth(
  score: number,
  label = "SCORE",
): number {
  return estimateBitmapTextWidth(
    formatHudScore(score, label),
    HUD_LETTER_SPACING,
    HUD_TEXT_SCALE,
  );
}

export function hudLivesTextWidth(lives: number): number {
  return estimateBitmapTextWidth(
    formatHudLives(lives),
    HUD_LETTER_SPACING,
    HUD_TEXT_SCALE,
  );
}

export function hudScoreLeftEdgeX(score: number, label = "SCORE"): number {
  return hudScoreAnchorX() - hudScoreTextWidth(score, label);
}

/** Returns true when score + lives labels fit in the HUD without overlapping. */
export function hudScoreLivesFit(
  score: number,
  lives: number,
  minGap = 8,
  label = "SCORE",
): boolean {
  const livesRight = hudLivesAnchorX() + hudLivesTextWidth(lives);
  const scoreLeft = hudScoreLeftEdgeX(score, label);
  return livesRight + minGap <= scoreLeft;
}
