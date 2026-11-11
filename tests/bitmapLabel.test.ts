import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PNG } from "pngjs";
import { describe, expect, it } from "vitest";
import {
  atlasGlyphMask,
  bitmapFontDefinition,
  bitmapLabelLogicalSize,
  resolveBitmapLabelGlyphs,
} from "../src/editor/bitmapLabel";

function loadAtlasAlpha(): { width: number; rows: Uint8Array } {
  const png = PNG.sync.read(readFileSync(join(process.cwd(), "public/ui/font-atlas.5x7.png")));
  const rows = new Uint8Array(png.width * png.height);
  for (let i = 0; i < rows.length; i += 1) {
    rows[i] = png.data[i * 4 + 3]!;
  }
  return { width: png.width, rows };
}

describe("bitmapLabel glyph map", () => {
  const atlas = loadAtlasAlpha();
  const font = bitmapFontDefinition();

  it("maps BEAST2D letters to the correct atlas slots", () => {
    const slots = resolveBitmapLabelGlyphs("BEAST2D");
    expect(slots.map((slot) => slot.char)).toEqual(["B", "E", "A", "S", "T", "2", "D"]);
    expect(slots[0]).toEqual({ char: "B", x: font.glyphs.B!.x, y: font.glyphs.B!.y });
    expect(slots[6]).toEqual({ char: "D", x: font.glyphs.D!.x, y: font.glyphs.D!.y });
  });

  it("maps CODE, EXPAND, and WED without digit or O confusion", () => {
    expect(resolveBitmapLabelGlyphs("CODE").map((s) => s.char)).toEqual(["C", "O", "D", "E"]);
    expect(resolveBitmapLabelGlyphs("EXPAND").map((s) => s.char)).toEqual(["E", "X", "P", "A", "N", "D"]);
    expect(resolveBitmapLabelGlyphs("WED").map((s) => s.char)).toEqual(["W", "E", "D"]);
    const d = resolveBitmapLabelGlyphs("D")[0]!;
    const o = resolveBitmapLabelGlyphs("O")[0]!;
    expect(d).not.toEqual(o);
  });

  it("uses distinct atlas pixels for B and D versus 8 and O", () => {
    const b = atlasGlyphMask("B", font, atlas.rows, atlas.width);
    const eight = atlasGlyphMask("8", font, atlas.rows, atlas.width);
    const d = atlasGlyphMask("D", font, atlas.rows, atlas.width);
    const o = atlasGlyphMask("O", font, atlas.rows, atlas.width);
    expect(b).not.toEqual(eight);
    expect(d).not.toEqual(o);
    expect(bitmapLabelLogicalSize("BEAST2D").width).toBe(41);
  });
});
