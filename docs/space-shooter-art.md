# Space Shooter — art & regeneration

Example-game visuals for Beast2D: palette-locked enemies, HUD chrome, and shared engine effects.

## Palette

All shooter PNGs use [Beast2D 16](./palette.md) indices only (alpha allowed). Shared palette helpers live in `devtools/assets/pixel/`.

## Layout

See [display spec](./display.md) and [HUD header](./hud-header.md) (geometry in core; shooter band textures in `shooterAssets.ts`).

| Region | Size | Notes |
|--------|------|--------|
| HUD | 320×16, y 0–15 | `HudHeaderUI` + `SHOOTER_HUD_THEME` |
| Playfield | 320×224, y 16–239 | Ship, enemies, effects |

## Regenerate assets (example scripts)

From **repository root** (requires root `npm install` for `tsx` / `pngjs` / `playwright`):

```bash
npm run assets:ui
npm --prefix devtools/levels/space-shooter run assets
npm --prefix devtools/levels/space-shooter run verify
```

Equivalent direct invocations:

```bash
npx tsx devtools/assets/generate-beast2d-ui.ts
npx tsx devtools/levels/space-shooter/generate-enemies.ts
npx tsx devtools/levels/space-shooter/upscale-contact-sheet.ts
npx tsx devtools/levels/space-shooter/verify-palette.ts
```

`generate-beast2d-ui.ts` writes `public/ui/` and `src/core/ui/defaultBitmapFont.ts` (Shooter re-exports via `shooterBitmapFont.ts`).

Generators:

- `devtools/assets/generate-beast2d-ui.ts` — shared HUD/dialog font + chrome
- `devtools/levels/space-shooter/generate-enemies.ts`
- `devtools/assets/pixel/` — shared palette + PNG writer

### Dev screenshots (not shipped in production)

```bash
npm run dev   # separate terminal
npm --prefix devtools/levels/space-shooter run capture
```

Loads `devtools/levels/space-shooter/capture/space-shooter-capture.html` (registers only Space Shooter — see `devCapture.ts`). Playwright uses SwiftShader so `canvas.toDataURL` returns real pixels.

## Code layout

| Concern | Location |
|---------|----------|
| Texture paths | `src/game/Space Shooter/shooterAssets.ts` |
| HUD / dialog chrome | `shooterUiTheme.ts` |
| Bitmap font | `shooterBitmapFont.ts` (generated) |
| Enemy prefabs | `Game Objects/` |

Engine reuse: `HudHeaderUI`, `DialogUI`, `BitmapText`, `NineSliceSprite`, `PixelBurstEffect`, palette in `src/core/`.

## Effects

Preset bursts in `src/core/effects/PixelEffectPresets.ts` (palette-only). Shooter wires them from `ShooterEnemy` / gameplay as needed.
