import { describe, expect, it } from "vitest";
import { isFloppySelectionPixel } from "../src/editor/pixelArt";

describe("floppy selection frame", () => {
  it("traces the chamfer and keeps the other corners square", () => {
    expect(isFloppySelectionPixel(0, 0)).toBe(true);
    expect(isFloppySelectionPixel(0, 71)).toBe(true);
    expect(isFloppySelectionPixel(63, 71)).toBe(true);
    // Top-right of a rounded rect would still be inked. The chamfer leaves it empty.
    expect(isFloppySelectionPixel(63, 0)).toBe(false);
    expect(isFloppySelectionPixel(63, 1)).toBe(false);
    // The stair itself is outside the body, one pixel thick along the diagonal.
    expect(isFloppySelectionPixel(56, 0)).toBe(true);
    expect(isFloppySelectionPixel(63, 7)).toBe(true);
    // Interior of the disk and the gap just inside the frame stay clear.
    expect(isFloppySelectionPixel(20, 30)).toBe(false);
    expect(isFloppySelectionPixel(1, 30)).toBe(false);
  });
});
