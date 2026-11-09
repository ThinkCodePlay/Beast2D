import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, beforeAll } from "vitest";
import { useBitmapFont } from "../src/core/ui/bitmapFontRegistry";
import { missingGlyphs } from "../src/core/ui/BitmapText";
import { DEFAULT_BEAST2D_BITMAP_FONT } from "../src/core/ui/defaultBitmapFont";
import { UI_BITMAP_STRINGS } from "./fixtures/uiBitmapStrings";
describe("bitmap font atlas", () => {
  beforeAll(() => {
    useBitmapFont(DEFAULT_BEAST2D_BITMAP_FONT);
  });

  it("default font matches public/ui/font-glyphs.json", () => {
    const json = JSON.parse(
      readFileSync(join(process.cwd(), "public/ui/font-glyphs.json"), "utf8"),
    ) as { glyphs: Record<string, { x: number; y: number }> };
    expect(DEFAULT_BEAST2D_BITMAP_FONT.glyphW).toBe(json.glyphW);
    expect(DEFAULT_BEAST2D_BITMAP_FONT.glyphs).toEqual(json.glyphs);
  });

  it("covers all demo HUD/dialog/hint UI strings", () => {
    for (const line of UI_BITMAP_STRINGS) {
      expect(missingGlyphs(line), line).toEqual([]);
    }
  });
});
