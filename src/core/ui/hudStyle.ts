import type { BitmapFontDefinition } from "./bitmapFontRegistry";

/** Per-game HUD chrome (textures + font) on top of shared {@link HUD_LAYOUT}. */
export type HudStyle = {
  bandTexture: string;
  heartTexture?: string;
  fontTint?: number;
  scoreLabel?: string;
  fontScale?: number;
  fontLetterSpacing?: number;
  bitmapFont?: Pick<BitmapFontDefinition, "glyphW" | "glyphH">;
};
