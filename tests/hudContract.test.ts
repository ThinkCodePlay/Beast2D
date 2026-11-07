import { describe, expect, it } from "vitest";
import {
  HUD_CONTRACT,
  hudLivesReservedWidth,
  hudScoreMaxWidth,
} from "../src/core/ui/hudContract";
import { measureBitmapText } from "../src/core/ui/BitmapText";

describe("HUD_CONTRACT (PR #8 alignment)", () => {
  it("matches the documented header geometry", () => {
    expect(HUD_CONTRACT.scoreRightX).toBe(316);
    expect(HUD_CONTRACT.livesLeftX).toBe(4);
    expect(HUD_CONTRACT.fontY).toBe(4);
    expect(HUD_CONTRACT.fontLetterSpacing).toBe(1);
    expect(HUD_CONTRACT.fontScale).toBe(1);
    expect(HUD_CONTRACT.heartSize).toBe(12);
    expect(HUD_CONTRACT.heartGap).toBe(2);
  });

  it("reserves lives strip width for three hearts", () => {
    expect(hudLivesReservedWidth(3)).toBe(48);
  });

  it("keeps representative scores at scale 1 inside the reserved column", () => {
    const opts = {
      scale: HUD_CONTRACT.fontScale,
      letterSpacing: HUD_CONTRACT.fontLetterSpacing,
    };
    for (const score of [0, 40, 400, 9990]) {
      const line = `${HUD_CONTRACT.scoreLabel} ${score}`;
      const width = measureBitmapText(line, opts);
      expect(width).toBeLessThanOrEqual(hudScoreMaxWidth(3));
      const right = HUD_CONTRACT.scoreRightX;
      const left = right - width;
      expect(left).toBeGreaterThan(hudLivesReservedWidth(3));
    }
  });
});
