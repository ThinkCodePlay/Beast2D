/** Active bitmap font atlas for {@link BitmapText}; set once per level/theme. */

export type BitmapFontDefinition = {
  glyphW: number;
  glyphH: number;
  cellW?: number;
  cellH?: number;
  atlasPath: string;
  glyphs: Record<string, { x: number; y: number }>;
};

/** Default cell size for HUD layout math when no font is registered yet. */
export const DEFAULT_BITMAP_GLYPH_W = 5;
export const DEFAULT_BITMAP_GLYPH_H = 7;

let activeFont: BitmapFontDefinition | null = null;

export function useBitmapFont(font: BitmapFontDefinition): void {
  activeFont = font;
}

export function getBitmapFont(): BitmapFontDefinition {
  if (!activeFont) {
    throw new Error(
      "Bitmap font not configured — call useBitmapFont() during level init.",
    );
  }
  return activeFont;
}

export function tryGetBitmapFont(): BitmapFontDefinition | null {
  return activeFont;
}

/** Clears atlas cache callers when switching fonts (import from BitmapText). */
export function clearBitmapFontRegistration(): void {
  activeFont = null;
}
