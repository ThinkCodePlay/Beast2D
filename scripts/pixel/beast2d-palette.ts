/** Beast2D 16 — single source for asset generators (keep in sync with docs/palette/beast2d-16.json). */
export const BEAST2D_16_HEX = [
  "#1f1424",
  "#8a5a44",
  "#3b2e3f",
  "#746678",
  "#f4ead2",
  "#75273c",
  "#c1386e",
  "#e86c9a",
  "#f7abcc",
  "#cb4a50",
  "#e28649",
  "#f1c766",
  "#4a784d",
  "#93be64",
  "#3a5b93",
  "#7ab2d5",
] as const;

export const BEAST2D_16 = BEAST2D_16_HEX.map((hex) => parseInt(hex.slice(1), 16)) as readonly number[];

export const PALETTE_NAMES = [
  "Plum Outline",
  "Dirt Brown",
  "Shadow",
  "Stone Gray",
  "Cream",
  "Deep Rose",
  "Magenta",
  "Hot Pink",
  "Light Pink",
  "Red",
  "Orange",
  "Yellow",
  "Moss Green",
  "Leaf Green",
  "Blue",
  "Sky Blue",
] as const;

export type PaletteIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;

/** Transparent cell marker in ASCII art grids. */
export const TRANSPARENT = -1;

export function paletteIndexToRgba(index: PaletteIndex): [number, number, number, number] {
  const n = BEAST2D_16[index];
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 255];
}

export function hexDigitToIndex(ch: string): PaletteIndex | typeof TRANSPARENT {
  if (ch === "." || ch === " ") return TRANSPARENT;
  const v = parseInt(ch, 16);
  if (Number.isNaN(v) || v < 0 || v > 15) {
    throw new Error(`Invalid palette digit "${ch}"`);
  }
  return v as PaletteIndex;
}
