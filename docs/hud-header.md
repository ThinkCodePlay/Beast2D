# HUD header contract (320×16)

Compact top band for single-screen Beast2D levels. Playfield begins at **y = 16** (`PLAYFIELD_TOP` / `HUD_HEIGHT`).

## Layout geometry (engine)

Defined in `src/core/ui/hudContract.ts` (`HUD_LAYOUT`): widths, padding, heart size, score column — **no game-specific textures**.

| Zone | Position | Content |
|------|----------|---------|
| Band | `(0,0)` 320×16 | Per-game texture via `HudHeaderTheme.bandTexture` |
| Lives | Left | `heartTexture` (default `HeartBeast.32x32.png` at 12×12, 2px gap, 4px inset) |
| Score | Right | Bitmap `SCORE <n>`, right edge inset 4px |

## Typography

Register a bitmap font with `useBitmapFont()` before `HudHeaderUI` renders. Layout assumes **5×7** glyphs at scale **1** (see `HUD_LAYOUT.fontY`).

Space Shooter sets `SHOOTER_BITMAP_FONT` and `SHOOTER_HUD_THEME` in `SpaceShooter.init()`.

## Integration

```ts
import { HudHeaderUI } from ".../HudHeaderUI";
import type { HudHeaderTheme } from ".../hudTheme";

const theme: HudHeaderTheme = {
  bandTexture: "…/hud-band.png",
  fontTint: 0xf4ead2,
};

levelRoot.addChild(new HudHeaderUI(0, 3, theme));
```

`HeartsUI` / `ScoreUI` static methods delegate to the active `HudHeaderUI`.

Shared UI chrome and the bitmap font live under **`public/ui/`** (regenerate with `npm run assets:ui`). Register with `DEFAULT_BEAST2D_BITMAP_FONT` + `DEFAULT_BEAST2D_HUD_THEME`.

## Related

- [Display spec](./display.md)
- [Space Shooter art](./space-shooter-art.md)
