import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const OUT = "/opt/cursor/artifacts";

async function main() {
  const browser = await chromium.launch();
  for (const w of [480, 800]) {
    const page = await browser.newPage({
      viewport: { width: w, height: Math.round(w * 0.65) },
      deviceScaleFactor: 2,
    });
    await page.goto(
      "http://127.0.0.1:5173/devtools/levels/space-shooter/capture/space-shooter-capture.html",
      { waitUntil: "networkidle" },
    );
    await page.waitForTimeout(2000);
    await mkdir(OUT, { recursive: true });
    await page.locator("canvas").screenshot({
      path: `${OUT}/shooter-hud-${w}.png`,
      type: "png",
    });
    await page.close();
  }
  await browser.close();
  console.log("shooter hud screenshots ok");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
