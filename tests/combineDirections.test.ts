import { describe, expect, it } from "vitest";
import { combineDirections } from "../src/core/components/Movement/combineDirections";

describe("combineDirections", () => {
  it("sums opposing horizontal to zero", () => {
    expect(combineDirections([{ x: 1, y: 0 }, { x: -1, y: 0 }])).toEqual({
      x: 0,
      y: 0,
    });
  });

  it("clamps diagonal sum to magnitude 1", () => {
    const v = combineDirections([
      { x: 1, y: 0 },
      { x: 0, y: 1 },
    ]);
    expect(v.x).toBeCloseTo(Math.SQRT1_2);
    expect(v.y).toBeCloseTo(Math.SQRT1_2);
  });

  it("does not double speed when sources align", () => {
    const v = combineDirections([
      { x: 0.5, y: 0 },
      { x: 0.5, y: 0 },
    ]);
    expect(v).toEqual({ x: 1, y: 0 });
  });
});
