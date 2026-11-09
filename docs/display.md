# Display spec

Beast2D games render in a fixed **320×240** virtual framebuffer (`DISPLAY_WIDTH`, `DISPLAY_HEIGHT` in `src/core/display.ts`). The engine defaults to one backing-store pixel per logical pixel (`Engine` `resolution: 1`, `antialias: false` in `main.ts`).

That framebuffer is scaled up to the browser window by **whole numbers only** (1×, 2×, 3×, …) with **nearest-neighbor** sampling—`configurePixelArtRendering()` sets Pixi `TextureStyle.defaultOptions.scaleMode = 'nearest'` before loads. The canvas uses crisp CSS integer scaling (`image-rendering: pixelated` / `crisp-edges` in `style.css`); `attachDisplayScaleFit()` in `main.ts` picks the largest integer that fits the window (centered in `#app`).

**Viewport smaller than 320×240:** scale stays at **1×** (no fractional CSS downscale). The frame may clip; resize the window or scroll the page. **Integer CSS scale alone does not guarantee** every sprite lands on device pixels—sub-pixel transforms, scaled parents, or non-grid positions can still look soft; keep gameplay on the pixel grid (`PIXEL_GRID`, `SPRITE_SIZE`).

**Not in this milestone:** camera letterboxing inside levels, HUD layout reflow, or editor UI scaling (still browser resolution).

## Tile grid

Gameplay and art align to **32×32** tiles:

- 320 ÷ 32 = **10** columns  
- 240 ÷ 32 = **7.5** rows  

Runtime sprites default to **32×32** (`SPRITE_SIZE`). The engine also exposes **`PIXEL_GRID` (16)** for half-tile layout snap (UI margins, fine placement).

## Single-screen levels

Levels that fit one screen (for example the Jetpack clone in issue #4) use a **10×7** tile playfield (**320×224** px).

The leftover **320×16** strip is the **HUD** (score, fuel, lives):

- **HUD:** **y = 0–15** (top edge)  
- **Level:** **y = 16–239**

Space Shooter follows this pattern today: hearts and score sit along the top at `y = PIXEL_GRID` (16 px).

## Scrolling levels

Side-scrollers and platformers (for example Bunny Hop) can be **any size in tiles**. The camera follows the player and clamps to the level bounds, so the half tile row at the bottom of the fixed view does not limit map height.

## Sprite sizes

| Size | Typical use |
| --- | --- |
| **32 px** | Tiles, player, enemies, pickups (`SPRITE_SIZE`) |
| **16 px** | Small things—bullets, particles, icons, gems |
| **64 px** | Bosses, title art, and **64 px masters** in `public/`; shrink to 32 with nearest-neighbor, then touch up by hand |

Some shipped levels draw **64×64** frames at runtime (see `BUNNY_SPRITE_SIZE` in Bunny Hop).

## Tools and editor UI

Level editors and tooling run at **browser resolution**, not 320×240. Panel chrome is laid out on an **8 px** grid, colored with the [Beast2D 16 palette](./palette.md), and scaled up by whole integers like the game canvas.
