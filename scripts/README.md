# Dev scripts (not part of the runtime engine)

These Node scripts support **local development** only. They are not imported by the game build and are not required to play levels in the browser.

| Script | Purpose |
|--------|---------|
| `generate-beast2d-ui.ts` | Regenerates shared HUD/dialog PNGs under `public/ui/` and `defaultBitmapFont.ts` (`npm run assets:ui`). |
| `capture-breakout-hud.mjs` | Playwright canvas screenshots for Breakout HUD QA (serve, gameplay score, game-over dialog, restart). Uses dev-only `globalThis.__beast2dBreakout` probe; fails fast if game-over is not reached. |
| `capture-breakout-endstate.mjs` | Single game-over screenshot (same lose-life inputs + probe). |
| `capture-shooter-hud.mjs` | Shooter HUD smoke screenshots at multiple viewports. |
| `smoke-levels.mjs` | Quick dev boot check for registered demo levels. |

Space Shooter **enemy** generators stay under `src/game/Space Shooter/scripts/`.
