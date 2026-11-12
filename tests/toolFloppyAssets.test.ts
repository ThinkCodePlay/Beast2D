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

const PALETTE = new Set([
  "1f1424",
  "3b2e3f",
  "746678",
  "f4ead2",
  "75273c",
  "c1386e",
  "e86c9a",
  "f7abcc",
  "cb4a50",
  "e28649",
  "f1c766",
  "93be64",
  "4a784d",
  "3a5b93",
  "7ab2d5",
]);

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

  it("keeps a blank 64×72 home shell on the Beast2D16 palette", () => {
    const png = PNG.sync.read(readFileSync("public/ui/floppy-home.png"));
    expect(png.width).toBe(64);
    expect(png.height).toBe(72);
    const alphas = new Set<number>();
    const colors = new Set<string>();
    for (let i = 0; i < png.data.length; i += 4) {
      alphas.add(png.data[i + 3] ?? 0);
      if ((png.data[i + 3] ?? 0) === 0) continue;
      const hex = [png.data[i], png.data[i + 1], png.data[i + 2]]
        .map((v) => (v ?? 0).toString(16).padStart(2, "0"))
        .join("");
      colors.add(hex);
    }
    expect([...alphas].sort((a, b) => a - b)).toEqual([0, 255]);
    for (const color of colors) expect(PALETTE.has(color)).toBe(true);
  });
});