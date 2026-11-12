import { describe, expect, it } from "vitest";
import { DISK_ART } from "../src/editor/pixelArt";

const INK = new Set("pmcygobdsnwrleuk.".split(""));

describe("home disk stickers", () => {
  it("covers the four shelf disks with even palette rows", () => {
    for (const id of ["hello", "space-run", "paddle", "bunny-hop"]) {
      const rows = DISK_ART[id];
      expect(rows, id).toBeTruthy();
      const width = rows![0]?.length ?? 0;
      expect(width).toBeGreaterThan(8);
      for (const row of rows!) {
        expect(row.length).toBe(width);
        for (const ch of row) expect(INK.has(ch)).toBe(true);
      }
    }
  });
});
