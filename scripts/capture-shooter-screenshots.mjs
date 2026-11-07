#!/usr/bin/env node
/**
 * Playwright + SwiftShader WebGL. Exports true 320×240 backing store + 2× nearest upscale.
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { PNG } from "pngjs";

const base =
  process.argv[2] ?? process.env.SHOOTER_CAPTURE_URL ?? "http://127.0.0.1:5173";
const outDir = process.env.SHOOTER_ARTIFACT_DIR ?? "/opt/cursor/artifacts";
mkdirSync(outDir, { recursive: true });

const scenes = [
  { name: "title", query: "?capture=shooter&scene=title", wait: 4000 },
  { name: "gameplay", query: "?capture=shooter&scene=gameplay", wait: 6000 },
  { name: "gameover", query: "?capture=shooter&scene=gameover", wait: 4000 },
];

function upscaleNearest(input, scale) {
  const out = new PNG({ width: input.width * scale, height: input.height * scale });
  for (let y = 0; y < input.height; y += 1) {
    for (let x = 0; x < input.width; x += 1) {
      const si = (y * input.width + x) * 4;
      for (let dy = 0; dy < scale; dy += 1) {
        for (let dx = 0; dx < scale; dx += 1) {
          const di = ((y * scale + dy) * out.width + (x * scale + dx)) * 4;
          out.data[di] = input.data[si];
          out.data[di + 1] = input.data[si + 1];
          out.data[di + 2] = input.data[si + 2];
          out.data[di + 3] = input.data[si + 3];
        }
      }
    }
  }
  return out;
}

function luminanceSpread(png) {
  let min = 255;
  let max = 0;
  for (let i = 0; i < png.data.length; i += 4) {
    if (png.data[i + 3] < 8) continue;
    const l = (png.data[i] + png.data[i + 1] + png.data[i + 2]) / 3;
    min = Math.min(min, l);
    max = Math.max(max, l);
  }
  return max - min;
}

async function readFramebufferPng(page) {
  const dataUrl = await page.evaluate(async () => {
    const c = document.querySelector("canvas");
    if (!c) return null;
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    return c.toDataURL("image/png");
  });
  if (!dataUrl) throw new Error("no canvas");
  const b64 = dataUrl.split(",")[1];
  return Buffer.from(b64, "base64");
}

const browser = await chromium.launch({
  headless: true,
  args: [
    "--enable-unsafe-swiftshader",
    "--use-angle=swiftshader",
    "--enable-webgl",
    "--disable-dev-shm-usage",
  ],
});

for (const scene of scenes) {
  const url = `${base}${scene.query}`;
  const ctx = await browser.newContext({
    viewport: { width: 640, height: 480 },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: "networkidle", timeout: 90_000 });
  await page.waitForTimeout(scene.wait);
  await page.locator("canvas").first().waitFor({ state: "visible", timeout: 20_000 });

  const raw = await readFramebufferPng(page);
  const png = PNG.sync.read(raw);
  if (png.width !== 320 || png.height !== 240) {
    console.warn(scene.name, "unexpected backing size", png.width, png.height);
  }

  const spread = luminanceSpread(png);
  const nativePath = join(outDir, `shooter-${scene.name}-native-320x240.png`);
  writeFileSync(nativePath, PNG.sync.write(png));
  writeFileSync(
    join(outDir, `shooter-${scene.name}-2x-640x480.png`),
    PNG.sync.write(upscaleNearest(png, 2)),
  );
  await page.screenshot({
    path: join(outDir, `shooter-${scene.name}-browser-640x480.png`),
    fullPage: false,
  });

  const enemyPixels = await page.evaluate(() => {
    const c = document.querySelector("canvas");
    if (!c) return 0;
    const ctx = c.getContext("webgl2") || c.getContext("webgl");
    return ctx ? 1 : 0;
  });

  console.log(scene.name, { url, spread, bytes: raw.length, webgl: enemyPixels });
  if (spread < 5) {
    console.error(`BLANK ${scene.name}`);
    process.exitCode = 2;
  }
  await ctx.close();
}

await browser.close();

writeFileSync(
  join(outDir, "enemy-contact-sheet-4x-review.png"),
  readFileSync(join(process.cwd(), "public/space-shooter/enemies/contact-sheet-4x.png")),
);
console.log("Artifacts:", outDir);
