import { describe, expect, it } from "vitest";
import {
  HUD_CONTRACT,
  hudLivesReservedWidth,
  hudScoreMaxWidth,
} from "../src/core/ui/hudContract";
import { measureBitmapText } from "../src/core/ui/BitmapText";
import { formatHudScoreLine } from "../src/core/ui/formatHudScore";

const textOpts = {
  scale: HUD_CONTRACT.fontScale,
  letterSpacing: HUD_CONTRACT.fontLetterSpacing,
};

describe("HUD header contract", () => {
  it("fits default score copy inside the score column at scale 1", () => {
    const line = formatHudScoreLine(999_999, HUD_CONTRACT.defaultLives);
    const w = measureBitmapText(line, textOpts);
    expect(w).toBeLessThanOrEqual(hudScoreMaxWidth(HUD_CONTRACT.defaultLives));
    expect(HUD_CONTRACT.fontScale).toBe(1);
  });

  it("fits showcase score 12800 at integer scale", () => {
    const line = formatHudScoreLine(12_800, HUD_CONTRACT.defaultLives);
    expect(line).toBe("SCORE 12800");
    expect(measureBitmapText(line, textOpts)).toBeLessThanOrEqual(
      hudScoreMaxWidth(HUD_CONTRACT.defaultLives),
    );
  });

  it("reserves lives strip on the left", () => {
    expect(hudLivesReservedWidth(3)).toBeLessThan(HUD_CONTRACT.scoreRightX / 2);
  });
});
