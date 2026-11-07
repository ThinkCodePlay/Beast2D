#!/usr/bin/env npx tsx
/** Nearest-neighbor 4× upscale of enemy contact sheet for art review. */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { PNG } from "pngjs";
import { REPO_ROOT } from "./repoRoot.ts";

const src = join(REPO_ROOT, "public/space-shooter/enemies/contact-sheet.png");
const scale = 4;
const input = PNG.sync.read(readFileSync(src));
const out = new PNG({
  width: input.width * scale,
  height: input.height * scale,
});

for (let y = 0; y < input.height; y += 1) {
  for (let x = 0; x < input.width; x += 1) {
    const si = (y * input.width + x) * 4;
    for (let dy = 0; dy < scale; dy += 1) {
      for (let dx = 0; dx < scale; dx += 1) {
        const ox = x * scale + dx;
        const oy = y * scale + dy;
        const di = (oy * out.width + ox) * 4;
        out.data[di] = input.data[si]!;
        out.data[di + 1] = input.data[si + 1]!;
        out.data[di + 2] = input.data[si + 2]!;
        out.data[di + 3] = input.data[si + 3]!;
      }
    }
  }
}

const dest = join(REPO_ROOT, "public/space-shooter/enemies/contact-sheet-4x.png");
writeFileSync(dest, PNG.sync.write(out));
console.log("Wrote", dest, `${out.width}x${out.height}`);
