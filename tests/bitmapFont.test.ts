import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { BITMAP_FONT } from "../src/core/ui/fontGlyphs";
import { missingGlyphs } from "../src/core/ui/BitmapText";

const REQUIRED = [
  "SPACE BEAST",
  "SCORE 0",
  "START",
  "RESTART",
  "GAME OVER",
];

describe("bitmap font atlas", () => {
  it("fontGlyphs.ts matches font-glyphs.json", () => {
    const json = JSON.parse(
      readFileSync(
        join(process.cwd(), "public/space-shooter/ui/font-glyphs.json"),
        "utf8",
      ),
    ) as { glyphs: Record<string, { x: number; y: number }> };
    expect(BITMAP_FONT.glyphW).toBe(json.glyphW);
    expect(BITMAP_FONT.glyphs).toEqual(json.glyphs);
  });

  it("covers all Space Shooter UI strings", () => {
    for (const line of REQUIRED) {
      expect(missingGlyphs(line), line).toEqual([]);
    }
  });
});
