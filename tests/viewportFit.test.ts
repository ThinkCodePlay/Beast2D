import { describe, expect, it } from "vitest";
import {
  computeViewportScale,
  DESIGN_HEIGHT,
  DESIGN_WIDTH,
} from "../src/core/viewportFit";

describe("computeViewportScale", () => {
  it("fits uniformly to the smaller axis", () => {
    expect(
      computeViewportScale(800, 600, DESIGN_WIDTH, DESIGN_HEIGHT),
    ).toBeCloseTo(2);
    expect(
      computeViewportScale(200, 600, DESIGN_WIDTH, DESIGN_HEIGHT),
    ).toBeCloseTo(0.5);
  });

  it("uses integer scale only when enlarging", () => {
    expect(
      computeViewportScale(900, 700, DESIGN_WIDTH, DESIGN_HEIGHT, {
        integerScale: true,
      }),
    ).toBe(2);
    expect(
      computeViewportScale(350, 260, DESIGN_WIDTH, DESIGN_HEIGHT, {
        integerScale: true,
      }),
    ).toBeCloseTo(260 / DESIGN_HEIGHT);
  });

  it("respects maxScale", () => {
    expect(
      computeViewportScale(2000, 2000, DESIGN_WIDTH, DESIGN_HEIGHT, {
        maxScale: 3,
      }),
    ).toBe(3);
  });
});
