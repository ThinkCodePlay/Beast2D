import { describe, expect, it } from "vitest";
import { stepMoveTowards } from "../src/core/moveTowards";
import { FRAMES_PER_SECOND } from "../src/core/Time";

describe("stepMoveTowards", () => {
  it("reaches the target without overshooting", () => {
    const dt = 1;
    const speed = 4;
    let pos = { x: 0, y: 0 };
    const target = { x: 10, y: 0 };
    for (let i = 0; i < 100; i++) {
      pos = stepMoveTowards(pos, target, speed * dt);
      expect(pos.x).toBeLessThanOrEqual(10);
      if (pos.x >= 10) break;
    }
    expect(pos.x).toBeCloseTo(10);
    expect(pos.y).toBe(0);
  });

  it("respects axis mask", () => {
    const next = stepMoveTowards(
      { x: 0, y: 0 },
      { x: 20, y: 20 },
      5,
      { x: true, y: false },
    );
    expect(next.x).toBe(5);
    expect(next.y).toBe(0);
  });

  it("stays consistent with frame delta scaling", () => {
    const from = { x: 0, y: 0 };
    const to = { x: 60, y: 0 };
    const speed = 5;
    const oneFrame = stepMoveTowards(from, to, speed * 1);
    const half = stepMoveTowards(from, to, speed * 0.5);
    expect(oneFrame.x).toBeCloseTo(speed);
    expect(half.x).toBeCloseTo(speed * 0.5);
    expect(oneFrame.x).toBeCloseTo(half.x * 2);
    expect(FRAMES_PER_SECOND).toBe(60);
  });
});
