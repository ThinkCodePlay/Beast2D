import { DISPLAY_WIDTH, HUD_HEIGHT, PIXEL_GRID } from "../consts";
import { DEFAULT_BITMAP_GLYPH_H } from "./bitmapFontRegistry";

/**
 * Beast2D compact playfield header geometry (320×16). Shared by demos;
 * textures and font atlas are supplied per game via {@link HudHeaderTheme}.
 */
export const HUD_LAYOUT = {
  width: DISPLAY_WIDTH,
  height: HUD_HEIGHT,
  playfieldTopY: HUD_HEIGHT,

  edgePaddingX: PIXEL_GRID / 4,

  heartSize: 12,
  heartGap: 2,
  defaultLives: 3,

  fontScale: 1,
  fontLetterSpacing: 1,
  fontGlyphH: DEFAULT_BITMAP_GLYPH_H,
  fontY: Math.floor((HUD_HEIGHT - DEFAULT_BITMAP_GLYPH_H) / 2),

  scoreLabel: "SCORE",
  scoreRightX: DISPLAY_WIDTH - PIXEL_GRID / 4,
  livesLeftX: PIXEL_GRID / 4,
} as const;

/** @deprecated Use {@link HUD_LAYOUT} — kept for older imports during migration. */
export const HUD_CONTRACT = HUD_LAYOUT;

export function hudLivesReservedWidth(
  lives: number = HUD_LAYOUT.defaultLives,
): number {
  const { heartSize, heartGap, livesLeftX } = HUD_LAYOUT;
  const strip = lives * heartSize + Math.max(0, lives - 1) * heartGap;
  return livesLeftX + strip + HUD_LAYOUT.edgePaddingX;
}

export function hudScoreMaxWidth(
  lives: number = HUD_LAYOUT.defaultLives,
): number {
  return HUD_LAYOUT.scoreRightX - hudLivesReservedWidth(lives);
}
