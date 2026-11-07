import { chromium } from "playwright";

const OUT = "/opt/cursor/artifacts/breakout-hud-endstate.png";

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 640, height: 560 },
    deviceScaleFactor: 2,
  });
  await page.goto("http://127.0.0.1:5173/?level=breakoutPaddle", {
    waitUntil: "networkidle",
  });
  await page.waitForTimeout(1200);
  const canvas = page.locator("canvas");

  for (let life = 0; life < 3; life += 1) {
    await page.keyboard.press("Space");
    await page.waitForTimeout(6000);
    if (life < 2) await page.keyboard.press("Space");
  }
  await page.waitForTimeout(500);
  await canvas.screenshot({ path: OUT, type: "png" });
  await browser.close();
  console.log("saved", OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
