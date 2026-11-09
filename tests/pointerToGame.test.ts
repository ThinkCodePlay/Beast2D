import { describe, expect, it } from "vitest";
import { pointerToGame } from "../src/core/components/Movement/pointerToGame";
import { DISPLAY_HEIGHT, DISPLAY_WIDTH } from "../src/core/display";

function mockCanvas(rect: {
  left: number;
  top: number;
  width: number;
  height: number;
}): HTMLCanvasElement {
  return {
    getBoundingClientRect: () => ({
      ...rect,
      right: rect.left + rect.width,
      bottom: rect.top + rect.height,
      x: rect.left,
      y: rect.top,
      toJSON: () => ({}),
    }),
  } as HTMLCanvasElement;
}

describe("pointerToGame", () => {
  it("maps CSS-scaled canvas pixels to logical 320×240", () => {
    const canvas = mockCanvas({ left: 100, top: 50, width: 640, height: 480 });
    const center = pointerToGame(
      100 + 320,
      50 + 240,
      canvas,
      DISPLAY_WIDTH,
      DISPLAY_HEIGHT,
    );
    expect(center.x).toBeCloseTo(DISPLAY_WIDTH / 2);
    expect(center.y).toBeCloseTo(DISPLAY_HEIGHT / 2);
  });
});
