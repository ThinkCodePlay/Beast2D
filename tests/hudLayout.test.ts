import { describe, expect, it } from "vitest";
import {
  formatHudScore,
  hudLivesTextWidth,
  hudScoreAnchorX,
  hudScoreLeftEdgeX,
  hudScoreLivesFit,
  hudScoreTextWidth,
} from "../src/core/ui/hudLayout";

describe("HUD layout contract", () => {
  it("anchors score on the right with padding", () => {
    expect(hudScoreAnchorX()).toBe(316);
  });

  it("keeps representative scores inside the header", () => {
    for (const score of [0, 40, 400, 9990]) {
      const line = formatHudScore(score);
      expect(hudScoreTextWidth(score)).toBeGreaterThan(0);
      expect(hudScoreLeftEdgeX(score)).toBe(
        hudScoreAnchorX() - hudScoreTextWidth(score),
      );
      expect(hudScoreLivesFit(score, 3)).toBe(true);
      expect(line).toMatch(/^SCORE \d+$/);
    }
  });

  it("reserves space for lives on the left", () => {
    expect(hudLivesTextWidth(3)).toBeLessThan(hudScoreLeftEdgeX(9990));
  });
});
