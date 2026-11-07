import {
  DISPLAY_WIDTH,
  HUD_HEIGHT,
  PIXEL_GRID,
  TEXTURE_HEART,
  TEXTURE_UI_FONT,
  TEXTURE_UI_HUD_BAND,
} from "../consts";
import { Beast2D16 } from "../palette/beast2d16";
import { BITMAP_FONT } from "./fontGlyphs";

/**
 * Beast2D compact playfield header (320×16). Shared with Space Shooter (PR #8)
 * and Breakout (PR #9). Gameplay must not overlap y 0–15.
 */
export const HUD_CONTRACT = {
  width: DISPLAY_WIDTH,
  height: HUD_HEIGHT,
  playfieldTopY: HUD_HEIGHT,

  bandTexture: TEXTURE_UI_HUD_BAND,
  fontAtlas: TEXTURE_UI_FONT,

  edgePaddingX: PIXEL_GRID / 4,

  heartTexture: TEXTURE_HEART,
  heartSize: 12,
  heartGap: 2,
  defaultLives: 3,

  fontScale: 1,
  fontLetterSpacing: 1,
  fontTint: Beast2D16.Cream,
  fontGlyphH: BITMAP_FONT.glyphH,
  fontY: Math.floor((HUD_HEIGHT - BITMAP_FONT.glyphH) / 2),

  scoreLabel: "SCORE",

  scoreRightX: DISPLAY_WIDTH - PIXEL_GRID / 4,
  livesLeftX: PIXEL_GRID / 4,
} as const;

export function hudLivesReservedWidth(
  lives: number = HUD_CONTRACT.defaultLives,
): number {
  const { heartSize, heartGap, livesLeftX, edgePaddingX } = HUD_CONTRACT;
  const strip = lives * heartSize + Math.max(0, lives - 1) * heartGap;
  return livesLeftX + strip + edgePaddingX;
}

export function hudScoreMaxWidth(
  lives: number = HUD_CONTRACT.defaultLives,
): number {
  return HUD_CONTRACT.scoreRightX - hudLivesReservedWidth(lives);
}
