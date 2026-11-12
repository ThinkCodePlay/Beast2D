import { readFileSync } from "node:fs";
import { PNG } from "pngjs";
import { describe, expect, it } from "vitest";

const FILES = [
  "public/ui/floppy-code.png",
  "public/ui/floppy-sprite.png",
  "public/ui/floppy-map.png",
  "public/ui/floppy-sfx.png",
  "public/ui/floppy-music.png",
];

describe("tool floppy assets", () => {
  it("keeps the native 64×72 files with binary alpha", () => {
    for (const file of FILES) {
      const png = PNG.sync.read(readFileSync(file));
      expect(png.width).toBe(64);
      expect(png.height).toBe(72);
      const alphas = new Set<number>();
      for (let i = 3; i < png.data.length; i += 4) alphas.add(png.data[i] ?? 0);
      expect([...alphas].sort((a, b) => a - b)).toEqual([0, 255]);
    }
  });
});