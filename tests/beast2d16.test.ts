import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { PNG } from "pngjs";
import { BEAST2D16_LIST, isBeast2D16Color } from "../src/core/palette/beast2d16";

describe("Beast2D16 palette", () => {
  it("lists 16 colors", () => {
    expect(BEAST2D16_LIST).toHaveLength(16);
    expect(isBeast2D16Color(BEAST2D16_LIST[7]!)).toBe(true);
    expect(isBeast2D16Color(0x000000)).toBe(false);
  });

  it("space-shooter PNGs only use palette colors", () => {
    const root = join(process.cwd(), "public/space-shooter");
    const palette = new Set(BEAST2D16_LIST);
    const walk = (dir: string): string[] => {
      const out: string[] = [];
      for (const ent of readdirSync(dir, { withFileTypes: true })) {
        const p = join(dir, ent.name);
        if (ent.isDirectory()) out.push(...walk(p));
        else if (ent.name.endsWith(".png")) out.push(p);
      }
      return out;
    };
    for (const file of walk(root)) {
      const png = PNG.sync.read(readFileSync(file));
      for (let i = 0; i < png.data.length; i += 4) {
        const a = png.data[i + 3]!;
        if (a === 0) continue;
        const rgb =
          (png.data[i]! << 16) | (png.data[i + 1]! << 8) | png.data[i + 2]!;
        expect(palette.has(rgb)).toBe(true);
      }
    }
  });
});
