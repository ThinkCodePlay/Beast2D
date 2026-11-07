import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, beforeAll } from "vitest";
import { useBitmapFont } from "../src/core/ui/bitmapFontRegistry";
import { missingGlyphs } from "../src/core/ui/BitmapText";
import { SHOOTER_BITMAP_FONT } from "../src/game/Space Shooter/shooterBitmapFont";

const REQUIRED = [
  "SPACE BEAST",
  "SCORE 0",
  "START",
  "RESTART",
  "GAME OVER",
];

describe("bitmap font atlas", () => {
  beforeAll(() => {
    useBitmapFont(SHOOTER_BITMAP_FONT);
  });

  it("shooterBitmapFont.ts matches font-glyphs.json", () => {
    const json = JSON.parse(
      readFileSync(
        join(process.cwd(), "public/space-shooter/ui/font-glyphs.json"),
        "utf8",
      ),
    ) as { glyphs: Record<string, { x: number; y: number }> };
    expect(SHOOTER_BITMAP_FONT.glyphW).toBe(json.glyphW);
    expect(SHOOTER_BITMAP_FONT.glyphs).toEqual(json.glyphs);
  });

  it("covers all Space Shooter UI strings", () => {
    for (const line of REQUIRED) {
      expect(missingGlyphs(line), line).toEqual([]);
    }
  });
});
