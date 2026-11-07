# Space Shooter — art & regeneration

Example-game visuals for Beast2D: palette-locked enemies, HUD chrome, and shared engine effects.

## Palette

All shooter PNGs use [Beast2D 16](./palette.md) indices only (alpha allowed). Shared palette helpers live in `scripts/pixel/`.

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
npm --prefix "src/game/Space Shooter/scripts" run assets
npm --prefix "src/game/Space Shooter/scripts" run verify
```

Equivalent direct invocations:

```bash
npx tsx scripts/generate-beast2d-ui.ts
npx tsx "src/game/Space Shooter/scripts/generate-enemies.ts"
npx tsx "src/game/Space Shooter/scripts/upscale-contact-sheet.ts"
npx tsx "src/game/Space Shooter/scripts/verify-palette.ts"
```

`generate-beast2d-ui.ts` writes `public/ui/` and `src/core/ui/defaultBitmapFont.ts` (Shooter re-exports via `shooterBitmapFont.ts`).

Generators:

- `scripts/generate-beast2d-ui.ts` — shared HUD/dialog font + chrome
- `src/game/Space Shooter/scripts/generate-enemies.ts`
- `scripts/pixel/` — shared palette + PNG writer

### Dev screenshots (not shipped in production)

```bash
npm run dev   # separate terminal
npm --prefix "src/game/Space Shooter/scripts" run capture
```

Loads `src/game/Space Shooter/space-shooter-capture.html` (registers only Space Shooter — see `devCapture.ts`). Playwright uses SwiftShader so `canvas.toDataURL` returns real pixels.

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
