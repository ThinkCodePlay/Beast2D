import { readFileSync } from "node:fs";
import { PNG } from "pngjs";
import { describe, expect, it } from "vitest";
import { BEAST_EMOJI, BEAST_EMOJI_SIZE } from "../src/core/ui/beastEmoji";

describe("mascot emoji", () => {
  it("is the approved 8×8 png, one print character", () => {
    expect(BEAST_EMOJI).toHaveLength(1);
    expect(BEAST_EMOJI_SIZE).toBe(8);
    const png = PNG.sync.read(readFileSync("public/ui/mascot-emoji-8.png"));
    expect(png.width).toBe(8);
    expect(png.height).toBe(8);
  });
});