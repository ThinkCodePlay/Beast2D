import { chromium } from "playwright";

const levels = ["bunnyHop", "spaceShooter", "breakoutPaddle"];
const widths = [480, 640, 800];

async function main() {
  const browser = await chromium.launch();
  for (const w of widths) {
    const page = await browser.newPage({
      viewport: { width: w, height: Math.round(w * 0.75) },
      deviceScaleFactor: 1,
    });
    for (const level of levels) {
      await page.goto(`http://127.0.0.1:5173/?level=${level}`, {
        waitUntil: "networkidle",
      });
      await page.waitForTimeout(1200);
      const canvas = page.locator("canvas");
      await canvas.waitFor({ state: "visible", timeout: 5000 });
      const box = await canvas.boundingBox();
      if (!box || box.width < 100) {
        throw new Error(`${level}@${w}: canvas missing`);
      }
    }
    await page.close();
  }
  await browser.close();
  console.log("smoke ok", levels.join(","), widths.join(","));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
