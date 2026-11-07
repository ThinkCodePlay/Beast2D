import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const CORE_ROOT = join(process.cwd(), "src/core");

function walkTsFiles(dir: string): string[] {
  const out: string[] = [];
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walkTsFiles(p));
    else if (ent.name.endsWith(".ts")) out.push(p);
  }
  return out;
}

describe("engine / example boundary", () => {
  it("src/core has no space-shooter asset path references", () => {
    const forbidden = /space-shooter/i;
    const hits: string[] = [];
    for (const file of walkTsFiles(CORE_ROOT)) {
      const text = readFileSync(file, "utf8");
      if (forbidden.test(text)) hits.push(file);
    }
    expect(hits, hits.join("\n")).toEqual([]);
  });

  it("production entry does not expose capture harness", () => {
    const main = readFileSync(join(process.cwd(), "src/main.ts"), "utf8");
    expect(main).not.toMatch(/capture\s*=\s*["']shooter["']/);
    expect(main).not.toMatch(/\bcapture=shooter\b/);
  });

  it("Space Shooter runtime has no capture mode helper", () => {
    const level = readFileSync(
      join(process.cwd(), "src/game/Space Shooter/SpaceShooter.ts"),
      "utf8",
    );
    expect(level).not.toMatch(/captureMode|getShooterCapture|CaptureEnemy/);
  });
});
