/**
 * Glyph UVs for `public/ui/font-atlas.5x7.png`.
 * Duplicates PR #8 `space-shooter/ui/font-glyphs.json` on a shared path so non-shooter
 * levels can load HUD text before that PR merges. Reconcile paths when integrating PR #8.
 */
export const BITMAP_FONT = {
  glyphW: 5,
  glyphH: 7,
  cellW: 7,
  cellH: 9,
  atlasPath: "ui/font-atlas.5x7.png",
  glyphs: {
    " ": { x: 1, y: 1 },
    "0": { x: 8, y: 1 },
    "1": { x: 15, y: 1 },
    "2": { x: 22, y: 1 },
    "3": { x: 29, y: 1 },
    "4": { x: 36, y: 1 },
    "5": { x: 43, y: 1 },
    "6": { x: 50, y: 1 },
    "7": { x: 57, y: 1 },
    "8": { x: 64, y: 1 },
    "9": { x: 71, y: 1 },
    ":": { x: 78, y: 1 },
    A: { x: 85, y: 1 },
    E: { x: 92, y: 1 },
    G: { x: 99, y: 1 },
    M: { x: 106, y: 1 },
    O: { x: 1, y: 10 },
    R: { x: 8, y: 10 },
    S: { x: 15, y: 10 },
    T: { x: 22, y: 10 },
    V: { x: 29, y: 10 },
    Y: { x: 36, y: 10 },
  } as Record<string, { x: number; y: number }>,
} as const;
