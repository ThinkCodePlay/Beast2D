import { describe, expect, it } from "vitest";
import { pointerArrivalDirection } from "../src/core/movement/pointerArrivalDirection";

describe("pointerArrivalDirection", () => {
  it("returns zero inside one step", () => {
    const d = pointerArrivalDirection(0, 0, 5, 0, { arriveRadius: 24, maxStep: 8 }, {
      x: true,
      y: false,
    });
    expect(d).toEqual({ x: 0, y: 0 });
  });

  it("scales magnitude with distance", () => {
    const d = pointerArrivalDirection(0, 0, 48, 0, { arriveRadius: 24, maxStep: 2 }, {
      x: true,
      y: false,
    });
    expect(d.x).toBeCloseTo(1);
    expect(d.y).toBe(0);
  });

  it("respects axis mask", () => {
    const d = pointerArrivalDirection(0, 0, 10, 40, { arriveRadius: 24, maxStep: 1 }, {
      x: true,
      y: false,
    });
    expect(d.y).toBe(0);
    expect(d.x).toBeGreaterThan(0);
  });
});
