import { describe, expect, it } from "vitest";
import {
  HUD_CONTRACT,
  hudLivesReservedWidth,
  hudScoreMaxWidth,
} from "../src/core/ui/hudContract";
import { measureBitmapText } from "../src/core/ui/BitmapText";

describe("HUD header contract", () => {
  it("fits default score copy inside the score column", () => {
    const line = `${HUD_CONTRACT.scoreLabel} 999999`;
    const w = measureBitmapText(line, {
      scale: HUD_CONTRACT.fontScale,
      letterSpacing: HUD_CONTRACT.fontLetterSpacing,
    });
    expect(w).toBeLessThanOrEqual(hudScoreMaxWidth(HUD_CONTRACT.defaultLives));
  });

  it("reserves lives strip on the left", () => {
    expect(hudLivesReservedWidth(3)).toBeLessThan(HUD_CONTRACT.scoreRightX / 2);
  });
});
