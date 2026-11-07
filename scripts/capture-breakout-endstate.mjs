import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const OUT = "/opt/cursor/artifacts/breakout-hud-endstate.png";

async function loseOneLife(page) {
  await page.keyboard.press("Space");
  await page.waitForTimeout(200);
  for (let i = 0; i < 40; i += 1) {
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(30);
  }
  await page.waitForTimeout(8500);
}

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 640, height: 560 },
    deviceScaleFactor: 2,
  });
  await page.goto(
    "http://127.0.0.1:5173/src/game/BreakoutPaddle/breakout-capture.html",
    { waitUntil: "networkidle" },
  );
  await page.waitForTimeout(1200);

  for (let life = 0; life < 3; life += 1) {
    await loseOneLife(page);
    const probe = await page.evaluate(() => globalThis.__beast2dBreakout ?? null);
    if (probe?.phase === "lost") break;
  }

  await page.waitForFunction(
    () => {
      const s = globalThis.__beast2dBreakout;
      return (
        s &&
        s.phase === "lost" &&
        s.dialogOpen === true &&
        s.dialogTextReady === true &&
        s.hintTextReady === true
      );
    },
    { timeout: 90_000 },
  );
  await mkdir("/opt/cursor/artifacts", { recursive: true });
  await page.locator("canvas").screenshot({ path: OUT, type: "png" });
  await browser.close();
  console.log("saved", OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
