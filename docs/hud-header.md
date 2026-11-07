# HUD header contract (320×16)

Compact top band for single-screen Beast2D levels. Playfield begins at **y = 16** (`PLAYFIELD_TOP` / `HUD_HEIGHT`).

## Layout

| Zone | Position | Content |
|------|----------|---------|
| Band | `(0,0)` 320×16 | `space-shooter/ui/hud-band.320x16.png` — Shadow fill, Plum outline top/bottom |
| Lives | Left | `HeartBeast.32x32.png` scaled to **12×12**, **2px** gap, inset **4px** from left |
| Score | Right | Bitmap string `SCORE <n>`, right edge inset **4px**, grows left |

## Typography (HUD)

Defined in code: `src/core/ui/hudContract.ts` (`HUD_CONTRACT`).

| Property | Value |
|----------|--------|
| Font | Generated `font-atlas.5x7.png` (mono cream ink, tinted at runtime) |
| Scale | **1** (integer; shrinks only if string wider than reserved score column) |
| Letter spacing | **1** px |
| Tint | `#f4ead2` Cream (`Beast2D16.Cream`) |
| Baseline Y | **4** px (`(16 − 7) / 2`) |

## Integration

```ts
import { HudHeaderUI } from ".../HudHeaderUI";

// In Level.init() — one instance at origin
levelRoot.addChild(new HudHeaderUI(0, 3));

// Gameplay code (static facades forward when header is active)
ScoreUI.addScore(100);
HeartsUI.decreaseHearts(1);
```

Use **`HudHeaderUI`** instead of separate `HeartsUI` + `ScoreUI` + band sprites. `HeartsUI` / `ScoreUI` static methods delegate to the active header.

Breakout and other demos should import the same `HUD_CONTRACT` values rather than duplicating magic numbers.

## Related

- [Display spec](./display.md)
- [Space Shooter art](./space-shooter-art.md)
