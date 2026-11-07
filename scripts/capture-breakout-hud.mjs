import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const BASE = "http://127.0.0.1:5173/?level=breakoutPaddle";
const OUT = "/opt/cursor/artifacts";

async function shot(page, name) {
  await mkdir(OUT, { recursive: true });
  await page.locator("canvas").screenshot({
    path: `${OUT}/${name}`,
    type: "png",
  });
}

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 640, height: 560 },
    deviceScaleFactor: 2,
  });
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await shot(page, "breakout-hud-serve.png");

  await page.keyboard.press("Space");
  await page.waitForTimeout(2500);
  for (let i = 0; i < 6; i += 1) {
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(60);
  }
  await page.waitForTimeout(2500);
  await shot(page, "breakout-hud-gameplay-score.png");

  for (let life = 0; life < 3; life += 1) {
    await page.waitForTimeout(5500);
    await page.keyboard.press("Space");
  }
  await page.waitForTimeout(800);
  await shot(page, "breakout-hud-gameover.png");

  await page.keyboard.press("Space");
  await page.waitForTimeout(1500);
  await shot(page, "breakout-hud-restart.png");

  await browser.close();
  console.log("saved", OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
