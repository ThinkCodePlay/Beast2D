import { chromium } from "playwright";

/** Dev entries only. `src/main.ts` always boots Space Shooter (no `?level=`). */
const levels = [
  {
    name: "spaceShooter",
    path: "/devtools/levels/space-shooter/capture/space-shooter-capture.html",
  },
  {
    name: "breakoutPaddle",
    path: "/devtools/levels/breakout-paddle/capture/breakout-capture.html",
  },
];
const widths = [480, 640, 800];

async function main() {
  const browser = await chromium.launch();
  for (const w of widths) {
    const page = await browser.newPage({
      viewport: { width: w, height: Math.round(w * 0.75) },
      deviceScaleFactor: 1,
    });
    for (const level of levels) {
      await page.goto(`http://127.0.0.1:5173${level.path}`, {
        waitUntil: "networkidle",
      });
      await page.waitForTimeout(1200);
      const canvas = page.locator("canvas");
      await canvas.waitFor({ state: "visible", timeout: 5000 });
      const box = await canvas.boundingBox();
      if (!box || box.width < 100) {
        throw new Error(`${level.name}@${w}: canvas missing`);
      }
    }
    await page.close();
  }
  await browser.close();
  console.log(
    "smoke ok",
    levels.map((level) => level.name).join(","),
    widths.join(","),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
