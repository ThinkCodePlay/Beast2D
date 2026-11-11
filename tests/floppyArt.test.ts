import { describe, expect, it } from "vitest";
import { TOOL_ICONS, iconIsSplitPair } from "../src/editor/pixelArt";

describe("tool floppy icons", () => {
  it("draws CODE as two separated angle brackets", () => {
    expect(iconIsSplitPair(TOOL_ICONS.CODE)).toBe(true);
  });

  it("keeps a distinct sticker for each tool", () => {
    for (const name of ["SPRITE", "MAP", "SFX", "MUSIC"]) {
      expect(TOOL_ICONS[name]?.length).toBeGreaterThan(3);
    }
  });
});
