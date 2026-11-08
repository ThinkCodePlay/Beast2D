import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const BASE =
  "http://127.0.0.1:5173/devtools/levels/breakout-paddle/capture/breakout-capture.html";
const OUT = "/opt/cursor/artifacts";

async function shot(page, name) {
  await mkdir(OUT, { recursive: true });
  await page.locator("canvas").screenshot({
    path: `${OUT}/${name}`,
    type: "png",
  });
}

/** Serve, move paddle away so the ball misses, wait for a life loss (ready or game over). */
async function loseOneLife(page) {
  await page.keyboard.press("Space");
  await page.waitForTimeout(200);
  for (let i = 0; i < 40; i += 1) {
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(30);
  }
  await page.waitForTimeout(8500);
}

async function waitForLostOrThrow(page) {
  const ok = await page
    .waitForFunction(
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
    )
    .then(() => true)
    .catch(() => false);
  if (!ok) {
    const s = await page.evaluate(() => globalThis.__beast2dBreakout ?? null);
    throw new Error(
      `game-over not reached (probe=${JSON.stringify(s)}). Fix lose-life timing or dev probe.`,
    );
  }
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

  // Fresh run for deterministic loss flow (avoid mid-rally state after gameplay shot).
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);

  for (let life = 0; life < 3; life += 1) {
    await loseOneLife(page);
    const probe = await page.evaluate(() => globalThis.__beast2dBreakout ?? null);
    if (probe?.phase === "lost") {
      break;
    }
    if (life === 2 && probe?.phase !== "lost") {
      throw new Error(`expected lost after 3 misses, got ${JSON.stringify(probe)}`);
    }
  }

  await waitForLostOrThrow(page);
  await page.waitForTimeout(400);
  await shot(page, "breakout-hud-gameover.png");

  await page.keyboard.press("Space");
  await page.waitForTimeout(1500);
  const after = await page.evaluate(() => globalThis.__beast2dBreakout ?? null);
  if (after?.phase !== "ready" || after?.lives !== 3) {
    throw new Error(`restart expected ready+3 lives, got ${JSON.stringify(after)}`);
  }
  await shot(page, "breakout-hud-restart.png");

  await browser.close();
  console.log("saved", OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
