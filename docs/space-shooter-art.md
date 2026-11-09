# Space Shooter — art

Example-game visuals for Beast2D: palette-locked enemies, HUD chrome, and shared engine effects.

## Palette

All shooter PNGs use [Beast2D 16](./palette.md) indices only (alpha allowed). Shared palette helpers live in `scripts/pixel/`.

## Layout

See [display spec](./display.md) and [HUD header](./hud-header.md) (geometry in core; texture paths in `shooterAssets.ts`).

| Region | Size | Notes |
|--------|------|--------|
| HUD | 320×16, y 0–15 | `HudHeaderUI` + `DEFAULT_BEAST2D_HUD_THEME` |
| Playfield | 320×224, y 16–239 | Ship, enemies, effects |

## Regenerate shared UI

From **repository root**:

```bash
npm run assets:ui
```

Writes `public/ui/` and `src/core/ui/defaultBitmapFont.ts`.

Enemy and bullet PNGs under `public/space-shooter/` are committed sources (no in-repo generator).

## Code layout

| Concern | Location |
|---------|----------|
| Texture paths | `src/game/Space Shooter/shooterAssets.ts` |
| HUD / dialog chrome | `src/core/ui/defaultUiTheme.ts` |
| Bitmap font | `src/core/ui/defaultBitmapFont.ts` (generated) |
| Enemy prefabs | `Game Objects/` |

Engine reuse: `HudHeaderUI`, `DialogUI`, `BitmapText`, `NineSliceSprite`, `PixelBurstEffect`, palette in `src/core/`.

## Effects

Preset bursts in `src/core/effects/PixelEffectPresets.ts` (palette-only). Shooter wires them from `ShooterEnemy` / gameplay as needed.
