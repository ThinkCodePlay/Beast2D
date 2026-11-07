# Space Shooter — art & regeneration

Visual milestone for the Beast2D Space Shooter: palette-locked enemies, HUD, and code-driven effects.

## Palette

All new shooter assets use [Beast2D 16](./palette.md) indices only (alpha allowed). Runtime validation: `npm run assets:verify-shooter` and Vitest `tests/beast2d16.test.ts`.

## Layout

See [display spec](./display.md):

| Region | Size | Notes |
|--------|------|--------|
| HUD | 320×16, y 0–15 | Band texture + bitmap score/lives |
| Playfield | 320×224, y 16–239 | Ship, enemies, effects |

## Sprite sizes

| Asset | Size | Location |
|-------|------|----------|
| Enemies | 32×32, 2–3 frame strips | `public/space-shooter/enemies/*-sheet.32x32.png` |
| Bullet | 16×16 | `public/space-shooter/bullet.16x16.png` |
| UI 9-slice | 24×24 panel, 48×16 button | `public/space-shooter/ui/` |
| Bitmap font | 5×7 glyphs | `public/space-shooter/ui/font-atlas.5x7.png` |

Player ship uses existing `public/BeastShip.32x32.png` (unchanged master).

## Regenerate assets

```bash
npm run assets:shooter      # TS generators (enemies + UI)
npm run assets:verify-shooter
```

Sources:

- `scripts/generate-space-shooter-enemies.ts` — scout, cruiser, drifter + contact sheet
- `scripts/generate-space-shooter-ui.ts` — HUD band, 9-slice, font atlas
- `scripts/pixel/` — shared palette + PNG writer (`pngjs`)

After changing glyphs, sync `src/core/ui/fontGlyphs.ts` with `font-glyphs.json` (or re-run generator and copy positions).

## Effects (engine)

Short palette bursts live in `src/core/effects/`:

| Preset | Frames | Use |
|--------|--------|-----|
| `MUZZLE_FLASH` | 3 | Bullet spawn |
| `EXPLOSION_SMALL` | 12 | Enemy / hit feedback |
| `EXHAUST_PUFF` | 8 | Cruiser trail accent |

Camera shake: `CameraShakeComponent` on `ShooterPlayfield` (respects `prefers-reduced-motion`). Player i-frames: `BlinkInvulnerabilityComponent` (~90 frames).

## Scaling note

Hi-DPI / integer canvas scaling is tracked in [PR #7](https://github.com/ThinkCodePlay/Beast2D/pull/7); this milestone keeps engine `resolution: 1` and CSS pixel scaling.
