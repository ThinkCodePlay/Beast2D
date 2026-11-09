import { describe, expect, it } from "vitest";
import { directionToPointer } from "../src/core/components/Movement/directionToPointer";
import { combineDirections } from "../src/core/components/Movement/combineDirections";

function applyPointerFrame(
  pos: { x: number; y: number },
  target: { x: number; y: number },
  speed: number,
  dt: number,
  arriveRadius = 24,
  axes = { x: true, y: false as const },
): { x: number; y: number } {
  const maxStep = speed * dt;
  const d = directionToPointer(
    pos.x,
    pos.y,
    target.x,
    target.y,
    { arriveRadius, maxStep },
    axes,
  );
  const combined = combineDirections([d]);
  let vx = combined.x;
  let vy = combined.y;
  if (!axes.x) vx = 0;
  if (!axes.y) vy = 0;
  return {
    x: pos.x + vx * maxStep,
    y: pos.y + vy * maxStep,
  };
}

describe("directionToPointer", () => {
  it("requests partial magnitude when target is less than one step away", () => {
    const d = directionToPointer(0, 0, 5, 0, { arriveRadius: 24, maxStep: 8 }, {
      x: true,
      y: false,
    });
    expect(d.x).toBeCloseTo(5 / 8);
    expect(d.y).toBe(0);
    const after = applyPointerFrame({ x: 0, y: 0 }, { x: 5, y: 0 }, 8, 1);
    expect(after.x).toBeCloseTo(5);
  });

  it("uses full magnitude when just above one step", () => {
    const d = directionToPointer(0, 0, 9, 0, { arriveRadius: 24, maxStep: 8 }, {
      x: true,
      y: false,
    });
    expect(d.x).toBeCloseTo(1);
  });

  it("respects axis mask with vertical offset", () => {
    const d = directionToPointer(0, 0, 10, 40, { arriveRadius: 24, maxStep: 4 }, {
      x: true,
      y: false,
    });
    expect(d.y).toBe(0);
    expect(d.x).toBeCloseTo(1);
  });

  it("converges without overshoot for pointer-only simulation", () => {
    let pos = { x: 100, y: 50 };
    const target = { x: 20, y: 50 };
    const speed = 7;
    for (let i = 0; i < 200; i++) {
      const next = applyPointerFrame(pos, target, speed, 1);
      expect(next.x).toBeLessThanOrEqual(pos.x);
      expect(next.x).toBeGreaterThanOrEqual(target.x - 1e-6);
      pos = next;
      if (Math.abs(pos.x - target.x) < 1e-4) break;
    }
    expect(pos.x).toBeCloseTo(target.x, 3);
  });

  it("converges with variable dt without dead zone at close range", () => {
    let pos = { x: 0, y: 0 };
    const target = { x: 3.5, y: 0 };
    const speed = 10;
    const dts = [1, 0.25, 2, 0.5, 1.5, 1];
    for (const dt of dts) {
      for (let i = 0; i < 20; i++) {
        const before = pos.x;
        pos = applyPointerFrame(pos, target, speed, dt);
        expect(pos.x).toBeLessThanOrEqual(target.x + 1e-6);
        expect(pos.x).toBeGreaterThanOrEqual(before - 1e-6);
        if (Math.abs(pos.x - target.x) < 1e-4) break;
      }
    }
    expect(pos.x).toBeCloseTo(target.x, 3);
  });

  it("large dt single frame does not overshoot close target", () => {
    const pos = applyPointerFrame(
      { x: 0, y: 0 },
      { x: 4, y: 0 },
      10,
      2,
    );
    expect(pos.x).toBeCloseTo(4);
    expect(pos.x).toBeLessThanOrEqual(4);
  });
});
