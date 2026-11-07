import { DISPLAY_WIDTH, HUD_HEIGHT, PIXEL_GRID } from "../consts";
import { Beast2D16 } from "../palette/beast2d16";
import { TEXTURE_HEART, TEXTURE_SHOOTER_HUD } from "../consts";
import { BITMAP_FONT } from "./fontGlyphs";

/**
 * Beast2D compact playfield header (320×16). Shared by Space Shooter and other
 * single-screen levels (e.g. Breakout on PR #9). Do not place gameplay or copy in y 0–15.
 */
export const HUD_CONTRACT = {
  width: DISPLAY_WIDTH,
  height: HUD_HEIGHT,
  playfieldTopY: HUD_HEIGHT,

  /** Top/bottom Plum-outline rules on `hud-band.320x16.png`. */
  bandTexture: TEXTURE_SHOOTER_HUD,

  /** Horizontal inset from framebuffer edges (8px grid / 2). */
  edgePaddingX: PIXEL_GRID / 4,

  /** Lives column (left). */
  heartTexture: TEXTURE_HEART,
  heartSize: 12,
  heartGap: 2,
  defaultLives: 3,

  /**
   * Bitmap HUD text (mono atlas + tint). Glyph cell = 5×7px.
   * Vertical center in 16px band: (16 − 7) / 2 = 4.
   */
  fontScale: 1,
  fontLetterSpacing: 1,
  fontTint: Beast2D16.Cream,
  fontGlyphH: BITMAP_FONT.glyphH,
  fontY: Math.floor((HUD_HEIGHT - BITMAP_FONT.glyphH) / 2),

  scoreLabel: "SCORE",

  /** Min x for score right edge; keeps gap after max lives strip. */
  scoreRightX: DISPLAY_WIDTH - PIXEL_GRID / 4,
  livesLeftX: PIXEL_GRID / 4,
} as const;

/** Width reserved on the left for `defaultLives` hearts (padding included). */
export function hudLivesReservedWidth(lives: number = HUD_CONTRACT.defaultLives): number {
  const { heartSize, heartGap, livesLeftX } = HUD_CONTRACT;
  const strip = lives * heartSize + Math.max(0, lives - 1) * heartGap;
  return livesLeftX + strip + HUD_CONTRACT.edgePaddingX;
}

export function hudScoreMaxWidth(lives: number = HUD_CONTRACT.defaultLives): number {
  return HUD_CONTRACT.scoreRightX - hudLivesReservedWidth(lives);
}
