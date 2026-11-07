import { describe, expect, it } from "vitest";
import {
  computeIntegerDisplayScale,
  displayCssSize,
} from "../src/core/displayScale";
import { DISPLAY_HEIGHT, DISPLAY_WIDTH } from "../src/core/consts";

describe("computeIntegerDisplayScale", () => {
  it("picks the uniform integer that fits both axes", () => {
    expect(
      computeIntegerDisplayScale(640, 480, DISPLAY_WIDTH, DISPLAY_HEIGHT, 0),
    ).toBe(2);
    expect(
      computeIntegerDisplayScale(1280, 960, DISPLAY_WIDTH, DISPLAY_HEIGHT, 0),
    ).toBe(4);
    expect(
      computeIntegerDisplayScale(900, 500, DISPLAY_WIDTH, DISPLAY_HEIGHT, 0),
    ).toBe(2);
  });

  it("never returns fractional upscale (floors toward zero)", () => {
    expect(
      computeIntegerDisplayScale(700, 500, DISPLAY_WIDTH, DISPLAY_HEIGHT, 0),
    ).toBe(2);
    expect(
      computeIntegerDisplayScale(500, 400, DISPLAY_WIDTH, DISPLAY_HEIGHT, 0),
    ).toBe(1);
  });

  it("stays at 1× when the viewport is smaller than native (no downscale)", () => {
    expect(
      computeIntegerDisplayScale(200, 150, DISPLAY_WIDTH, DISPLAY_HEIGHT, 0),
    ).toBe(1);
    expect(
      computeIntegerDisplayScale(319, 239, DISPLAY_WIDTH, DISPLAY_HEIGHT, 0),
    ).toBe(1);
  });

  it("subtracts padding before fitting", () => {
    expect(
      computeIntegerDisplayScale(672, 512, DISPLAY_WIDTH, DISPLAY_HEIGHT, 16),
    ).toBe(2);
    expect(
      computeIntegerDisplayScale(640, 480, DISPLAY_WIDTH, DISPLAY_HEIGHT, 16),
    ).toBe(1);
  });

  it("handles invalid or empty space defensively", () => {
    expect(computeIntegerDisplayScale(0, 0, DISPLAY_WIDTH, DISPLAY_HEIGHT)).toBe(
      1,
    );
    expect(
      computeIntegerDisplayScale(100, 100, DISPLAY_WIDTH, DISPLAY_HEIGHT, 80),
    ).toBe(1);
  });
});

describe("displayCssSize", () => {
  it("multiplies design resolution by scale", () => {
    expect(displayCssSize(3)).toEqual({ width: 960, height: 720 });
  });
});
