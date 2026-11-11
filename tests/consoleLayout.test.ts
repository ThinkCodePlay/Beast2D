import { describe, expect, it } from "vitest";
import { chromeFontScale, fitPreviewScale } from "../src/editor/consoleLayout";

describe("console layout", () => {
  it("uses 16px chrome below 640px and 32px at mockup height", () => {
    expect(chromeFontScale(480)).toBe(1);
    expect(chromeFontScale(800)).toBe(2);
  });

  it("picks the largest integer playfield scale that fits the panel", () => {
    expect(fitPreviewScale(655, 584)).toBe(2);
    expect(fitPreviewScale(319, 240)).toBe(1);
    expect(fitPreviewScale(960, 720)).toBe(3);
    expect(fitPreviewScale(0, 400)).toBe(1);
  });
});
