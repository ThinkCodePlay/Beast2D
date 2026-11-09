import { describe, expect, it, beforeAll } from "vitest";
import {
  HUD_LAYOUT,
  hudLivesReservedWidth,
  hudScoreMaxWidth,
} from "../src/core/ui/hudLayout";
import { useBitmapFont } from "../src/core/ui/bitmapFontRegistry";
import { measureBitmapText } from "../src/core/ui/BitmapText";
import { formatHudScoreLine } from "../src/core/ui/formatHudScore";
import { DEFAULT_BEAST2D_BITMAP_FONT } from "../src/core/ui/defaultBitmapFont";

beforeAll(() => {
  useBitmapFont(DEFAULT_BEAST2D_BITMAP_FONT);
});

const textOpts = {
  scale: HUD_LAYOUT.fontScale,
  letterSpacing: HUD_LAYOUT.fontLetterSpacing,
};

describe("HUD header contract", () => {
  it("fits default score copy inside the score column at scale 1", () => {
    const line = formatHudScoreLine(999_999, HUD_LAYOUT.defaultLives);
    const w = measureBitmapText(line, textOpts);
    expect(w).toBeLessThanOrEqual(hudScoreMaxWidth(HUD_LAYOUT.defaultLives));
    expect(HUD_LAYOUT.fontScale).toBe(1);
  });

  it("fits showcase score 12800 at integer scale", () => {
    const line = formatHudScoreLine(12_800, HUD_LAYOUT.defaultLives);
    expect(line).toBe("SCORE 12800");
    expect(measureBitmapText(line, textOpts)).toBeLessThanOrEqual(
      hudScoreMaxWidth(HUD_LAYOUT.defaultLives),
    );
  });

  it("reserves lives strip on the left", () => {
    expect(hudLivesReservedWidth(3)).toBeLessThan(HUD_LAYOUT.scoreRightX / 2);
  });
});
