#!/usr/bin/env npx tsx
/** Fail if any pixel in generated shooter PNGs uses a non-palette RGB (alpha>0). */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { PNG } from "pngjs";
import { REPO_ROOT } from "./repoRoot.ts";
import { BEAST2D_16 } from "../../assets/pixel/beast2d-palette.ts";

const PALETTE = new Set(BEAST2D_16);

function checkFile(filePath: string): string[] {
  const buf = readFileSync(filePath);
  const png = PNG.sync.read(buf);
  const errors: string[] = [];
  for (let i = 0; i < png.data.length; i += 4) {
    const a = png.data[i + 3]!;
    if (a === 0) continue;
    const rgb =
      (png.data[i]! << 16) | (png.data[i + 1]! << 8) | png.data[i + 2]!;
    if (!PALETTE.has(rgb)) {
      const px = i / 4;
      const x = px % png.width;
      const y = Math.floor(px / png.width);
      errors.push(`${filePath}:${x},${y} #${rgb.toString(16).padStart(6, "0")}`);
      if (errors.length >= 20) break;
    }
  }
  return errors;
}

function walk(dir: string): string[] {
  const files: string[] = [];
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, ent.name);
    if (ent.isDirectory()) files.push(...walk(p));
    else if (ent.name.endsWith(".png")) files.push(p);
  }
  return files;
}

const root = join(REPO_ROOT, "public/space-shooter");
const allErrors: string[] = [];
for (const f of walk(root)) {
  allErrors.push(...checkFile(f));
}

if (allErrors.length > 0) {
  console.error("Palette violations:");
  for (const e of allErrors) console.error(" ", e);
  process.exit(1);
}
console.log("All space-shooter PNGs pass palette check.");
