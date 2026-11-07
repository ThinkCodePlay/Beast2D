#!/usr/bin/env npx tsx
/** 9-slice panel/button + bitmap font atlas for Space Shooter UI. */
import { join } from "node:path";
import { writeFileSync } from "node:fs";
import { BEAST2D_16 } from "./pixel/beast2d-palette.ts";
import {
  indicesToRgba,
  parseAsciiGrid,
  writeRgbaPng,
} from "./pixel/write-rgba-png.ts";

const OUT = join(process.cwd(), "public/space-shooter/ui");
/** Flat 9-slice tile: outline 0, rim 6, fill 2 (no dither). */
function solidBorderPanel(size: number, border: number): Int8Array {
  const cells = new Int8Array(size * size).fill(2);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const idx = y * size + x;
      if (x === 0 || y === 0 || x === size - 1 || y === size - 1) {
        cells[idx] = 0;
      } else if (
        x < border ||
        y < border ||
        x >= size - border ||
        y >= size - border
      ) {
        cells[idx] = 6;
      }
    }
  }
  return cells;
}

const panelSize = 24;
const panelBorder = 8;
writeRgbaPng(
  join(OUT, "panel-9slice.24x24.png"),
  panelSize,
  panelSize,
  indicesToRgba(
    panelSize,
    panelSize,
    solidBorderPanel(panelSize, panelBorder),
    BEAST2D_16,
  ),
);

const btnW = 48;
const btnH = 16;
const btn = new Int8Array(btnW * btnH).fill(7);
for (let y = 0; y < btnH; y += 1) {
  for (let x = 0; x < btnW; x += 1) {
    const idx = y * btnW + x;
    if (y === 0 || y === btnH - 1 || x === 0 || x === btnW - 1) {
      btn[idx] = 0;
    } else if (y === 1) {
      btn[idx] = 8;
    } else if (y === btnH - 2) {
      btn[idx] = 5;
    }
  }
}
writeRgbaPng(
  join(OUT, "button.48x16.png"),
  btnW,
  btnH,
  indicesToRgba(btnW, btnH, btn, BEAST2D_16),
);

const hudW = 320;
const hudH = 16;
const hud = new Int8Array(hudW * hudH).fill(2);
for (let x = 0; x < hudW; x += 1) {
  hud[x] = 0;
  hud[(hudH - 1) * hudW + x] = 0;
}
writeRgbaPng(
  join(OUT, "hud-band.320x16.png"),
  hudW,
  hudH,
  indicesToRgba(hudW, hudH, hud, BEAST2D_16),
);

/** 5×7 mono-ink glyphs (`.` transparent, `4` = palette cream ink). */
const GLYPHS: Record<string, string[]> = {
  " ": [".....", ".....", ".....", ".....", ".....", ".....", "....."],
  "0": [".444.", "4..44", "4.4.4", "4.4.4", "4.4.4", "4..44", ".444."],
  "1": ["..4..", ".44..", "..4..", "..4..", "..4..", "..4..", ".444."],
  "2": [".444.", "4..44", "...44", "..44.", ".44..", "44...", "4444."],
  "3": [".444.", "4..44", "...44", "..444", "...44", "4..44", ".444."],
  "4": [".4..4", "4..44", "4.444", "44444", "...44", "...44", "...44"],
  "5": ["4444.", "4....", "444..", "....4", "....4", "4..44", ".444."],
  "6": [".444.", "4..44", "4....", "4444.", "4.4.4", "4..44", ".444."],
  "7": ["44444", "...44", "..44.", ".44..", ".44..", ".44..", ".44.."],
  "8": [".444.", "4..44", "4..44", ".444.", "4..44", "4..44", ".444."],
  "9": [".444.", "4..44", "4..44", ".4444", "....4", "4..44", ".444."],
  ":": [".....", "..4..", "..4..", ".....", "..4..", "..4..", "....."],
  A: [".444.", "4..44", "4..44", "44444", "4..44", "4..44", "4..44"],
  B: [".444.", "4..44", "4..44", ".444.", "4..44", "4..44", ".444."],
  C: [".444.", "4..44", "4....", "4....", "4....", "4..44", ".444."],
  E: ["4444.", "4....", "4....", ".444.", "4....", "4....", "4444."],
  G: [".444.", "4..44", "4....", "4.444", "4..44", "4..44", ".444."],
  M: ["4...4", "44.44", "4.4.4", "4...4", "4...4", "4...4", "4...4"],
  O: [".444.", "4..44", "4...4", "4...4", "4...4", "4..44", ".444."],
  P: [".444.", "4..44", "4..44", ".444.", "4....", "4....", "4...."],
  R: [".444.", "4..44", "4..44", ".444.", "4.44.", "4..44", "4..44"],
  S: [".444.", "4..44", "4....", ".444.", "....4", "4..44", ".444."],
  T: ["44444", "..4..", "..4..", "..4..", "..4..", "..4..", "..4.."],
  V: ["4...4", "4...4", "4...4", "4...4", ".4.4.", ".4.4.", "..4.."],
  Y: ["4...4", "4...4", ".4.4.", "..4..", "..4..", "..4..", "..4.."],
};

const REQUIRED_UI_STRINGS = [
  "SPACE BEAST",
  "SCORE",
  "START",
  "RESTART",
  "GAME OVER",
  "0123456789",
];

const glyphW = 5;
const glyphH = 7;
const pad = 1;
const cellW = glyphW + pad * 2;
const cellH = glyphH + pad * 2;
const chars = Object.keys(GLYPHS).sort();
const cols = 16;
const rows = Math.ceil(chars.length / cols);
const atlasW = cols * cellW;
const atlasH = rows * cellH;
const atlas = new Int8Array(atlasW * atlasH).fill(-1);

const glyphMap: Record<string, { x: number; y: number }> = {};

for (const [ch, rows] of Object.entries(GLYPHS)) {
  for (let i = 0; i < rows.length; i += 1) {
    const len = rows[i]!.length;
    if (len !== glyphW) {
      throw new Error(
        `Glyph ${ch} row ${i} width ${len} != ${glyphW} (${JSON.stringify(rows[i])})`,
      );
    }
  }
}

for (const req of REQUIRED_UI_STRINGS) {
  for (const ch of req.toUpperCase()) {
    if (ch === " ") continue;
    if (!GLYPHS[ch]) {
      throw new Error(`Missing glyph for '${ch}' (required by UI copy)`);
    }
  }
}

for (let i = 0; i < chars.length; i += 1) {
  const ch = chars[i]!;
  const col = i % cols;
  const row = Math.floor(i / cols);
  const ox = col * cellW + pad;
  const oy = row * cellH + pad;
  glyphMap[ch] = { x: ox, y: oy };
  const rowsGlyph = GLYPHS[ch]!;
  const parsed = parseAsciiGrid(rowsGlyph);
  for (let y = 0; y < glyphH; y += 1) {
    for (let x = 0; x < glyphW; x += 1) {
      const v = parsed.cells[y * glyphW + x]!;
      if (v >= 0) {
        atlas[(oy + y) * atlasW + ox + x] = v;
      }
    }
  }
}

writeRgbaPng(
  join(OUT, "font-atlas.5x7.png"),
  atlasW,
  atlasH,
  indicesToRgba(atlasW, atlasH, atlas, BEAST2D_16),
);

const fontMeta = { glyphW, glyphH, cellW, cellH, glyphs: glyphMap };
writeFileSync(
  join(OUT, "font-glyphs.json"),
  JSON.stringify(fontMeta, null, 2),
);

const tsPath = join(process.cwd(), "src/core/ui/fontGlyphs.ts");
const tsBody = `// AUTO-GENERATED by scripts/generate-space-shooter-ui.ts — do not edit by hand.
// Re-run: npm run assets:shooter
export const BITMAP_FONT = {
  glyphW: ${glyphW},
  glyphH: ${glyphH},
  cellW: ${cellW},
  cellH: ${cellH},
  atlasPath: "space-shooter/ui/font-atlas.5x7.png",
  glyphs: ${JSON.stringify(glyphMap, null, 2)} as Record<string, { x: number; y: number }>,
} as const;
`;
writeFileSync(tsPath, tsBody);
console.log("Wrote UI assets to", OUT);
console.log("Updated", tsPath);
