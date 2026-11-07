#!/usr/bin/env npx tsx
/** 9-slice panel/button + bitmap font atlas for Space Shooter UI. */
import { join } from "node:path";
import { BEAST2D_16 } from "./pixel/beast2d-palette.ts";
import {
  indicesToRgba,
  parseAsciiGrid,
  writeRgbaPng,
} from "./pixel/write-rgba-png.ts";

const OUT = join(process.cwd(), "public/space-shooter/ui");

function solidBorderPanel(size: number, border: number): Int8Array {
  const cells = new Int8Array(size * size).fill(4);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const edge =
        x < border || y < border || x >= size - border || y >= size - border;
      const idx = y * size + x;
      if (x === 0 || y === 0 || x === size - 1 || y === size - 1) {
        cells[idx] = 0;
      } else if (edge) {
        cells[idx] = 6;
      } else if ((x + y) % 8 === 0) {
        cells[idx] = 5;
      } else {
        cells[idx] = 2;
      }
    }
  }
  return cells;
}

const panelSize = 24;
const panelBorder = 8;
const panelCells = solidBorderPanel(panelSize, panelBorder);
writeRgbaPng(
  join(OUT, "panel-9slice.24x24.png"),
  panelSize,
  panelSize,
  indicesToRgba(panelSize, panelSize, panelCells, BEAST2D_16),
);

/** Button: 48×16 with raised center. */
const btnW = 48;
const btnH = 16;
const btn = new Int8Array(btnW * btnH).fill(6);
for (let y = 0; y < btnH; y += 1) {
  for (let x = 0; x < btnW; x += 1) {
    const idx = y * btnW + x;
    if (y === 0 || y === btnH - 1 || x === 0 || x === btnW - 1) {
      btn[idx] = 0;
    } else if (y === 1 || x === 1) {
      btn[idx] = 8;
    } else if (y === btnH - 2 || x === btnW - 2) {
      btn[idx] = 5;
    } else {
      btn[idx] = 7;
    }
  }
}
writeRgbaPng(
  join(OUT, "button.48x16.png"),
  btnW,
  btnH,
  indicesToRgba(btnW, btnH, btn, BEAST2D_16),
);

/** HUD strip background 320×16 */
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

/** 5×7 bitmap glyphs — rows of `.` and hex digits; combined into atlas later. */
const GLYPHS: Record<string, string[]> = {
  " ": [".....", ".....", ".....", ".....", ".....", ".....", "....."],
  "0": [".000.", "0..40", "0.540", "0.5.0", "0.5.0", "0..40", ".000."],
  "1": ["..1..", ".11..", "..1..", "..1..", "..1..", "..1..", ".111."],
  "2": [".222.", "2..42", "...42", "..24.", ".24..", "24...", "24444"],
  "3": [".333.", "3..43", "...43", "..33.", "...43", "3..43", ".333."],
  "4": [".4..4", "4..44", "4.444", "44444", "...44", "...44", "...44"],
  "5": ["5555.", "5....", "555..", "....5", "....5", "5...5", ".555."],
  "6": [".666.", "6...6", "6....", "6666.", "6..56", "6...6", ".666."],
  "7": ["77777", "...74", "..74.", ".74..", ".74..", ".74..", ".74.."],
  "8": [".888.", "8..48", "8..48", ".888.", "8..48", "8..48", ".888."],
  "9": [".999.", "9..49", "9..49", ".9999", "....9", "9..49", ".999."],
  ":": [".....", "..a..", "..a..", ".....", "..a..", "..a..", "....."],
  "A": [".777.", "7..47", "7..47", "74447", "7..47", "7..47", "7..47"],
  "E": ["4444.", "4....", "4....", "444..", "4....", "4....", "4444."],
  "G": [".666.", "6...6", "6....", "6.666", "6...6", "6...6", ".666."],
  "M": ["6...6", "66.66", "6.6.6", "6...6", "6...6", "6...6", "6...6"],
  "O": [".666.", "6..46", "6...6", "6...6", "6...6", "6..46", ".666."],
  "R": ["7444.", "7..47", "7..47", "7444.", "7.74.", "7..47", "7..47"],
  "S": [".444.", "4...4", "4....", ".444.", "....4", "4...4", ".444."],
  "T": ["77777", "..7..", "..7..", "..7..", "..7..", "..7..", "..7.."],
  "V": ["7...7", "7...7", "7...7", "7...7", ".7.7.", ".7.7.", "..7.."],
  "Y": ["7...7", "7...7", ".7.7.", "..7..", "..7..", "..7..", "..7.."],
};

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

import { writeFileSync } from "node:fs";
writeFileSync(
  join(OUT, "font-glyphs.json"),
  JSON.stringify({ glyphW, glyphH, cellW, cellH, glyphs: glyphMap }, null, 2),
);
console.log("Wrote UI assets to", OUT);
