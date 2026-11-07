import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { PNG } from "pngjs";

/** Write a raw RGBA buffer (width * height * 4) as a PNG file. */
export function writeRgbaPng(
  filePath: string,
  width: number,
  height: number,
  rgba: Uint8Array,
): void {
  if (rgba.length !== width * height * 4) {
    throw new Error(
      `RGBA length ${rgba.length} does not match ${width}x${height}`,
    );
  }
  mkdirSync(dirname(filePath), { recursive: true });
  const png = new PNG({ width, height });
  png.data = Buffer.from(rgba);
  const out = PNG.sync.write(png);
  writeFileSync(filePath, out);
}

/** Build RGBA from per-cell palette indices (row-major). */
export function indicesToRgba(
  width: number,
  height: number,
  cells: Int8Array,
  paletteRgb: readonly number[],
): Uint8Array {
  const rgba = new Uint8Array(width * height * 4);
  for (let i = 0; i < cells.length; i += 1) {
    const idx = cells[i];
    const o = i * 4;
    if (idx < 0) {
      rgba[o] = 0;
      rgba[o + 1] = 0;
      rgba[o + 2] = 0;
      rgba[o + 3] = 0;
    } else {
      const c = paletteRgb[idx]!;
      rgba[o] = (c >> 16) & 255;
      rgba[o + 1] = (c >> 8) & 255;
      rgba[o + 2] = c & 255;
      rgba[o + 3] = 255;
    }
  }
  return rgba;
}

/** Parse fixed-width ASCII rows into index cells (`.` = transparent). */
export function parseAsciiGrid(rows: string[]): { width: number; height: number; cells: Int8Array } {
  const height = rows.length;
  const width = rows[0]?.length ?? 0;
  for (const row of rows) {
    if (row.length !== width) {
      throw new Error("ASCII grid rows must share width");
    }
  }
  const cells = new Int8Array(width * height);
  for (let y = 0; y < height; y += 1) {
    const row = rows[y]!;
    for (let x = 0; x < width; x += 1) {
      const ch = row[x]!;
      if (ch === "." || ch === " ") {
        cells[y * width + x] = -1;
      } else {
        const v = parseInt(ch, 16);
        if (Number.isNaN(v) || v < 0 || v > 15) {
          throw new Error(`Bad cell at ${x},${y}: "${ch}"`);
        }
        cells[y * width + x] = v;
      }
    }
  }
  return { width, height, cells };
}

/** Horizontal strip: frames placed side by side (same height). */
export function stitchFramesHorizontal(
  frames: { width: number; height: number; cells: Int8Array }[],
): { width: number; height: number; cells: Int8Array } {
  if (frames.length === 0) throw new Error("No frames");
  const height = frames[0]!.height;
  const width = frames.reduce((sum, f) => {
    if (f.height !== height) throw new Error("Frame heights must match");
    return sum + f.width;
  }, 0);
  const cells = new Int8Array(width * height);
  let ox = 0;
  for (const frame of frames) {
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < frame.width; x += 1) {
        cells[y * width + ox + x] = frame.cells[y * frame.width + x]!;
      }
    }
    ox += frame.width;
  }
  return { width, height, cells };
}
