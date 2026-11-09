# Display spec

Beast2D targets a fixed **320×240** virtual resolution (4∶3), scaled in CSS for crisp pixel art.

## Window fit (implemented)

`src/core/displayScale.ts` computes the largest **integer** uniform scale that fits the window (minus padding). `main.ts` calls `attachDisplayScaleFit()` on the `.game-container` and `configurePixelArtRendering()` before the engine boots.

| Viewport vs native | Behavior |
| --- | --- |
| Larger | 2×, 3×, … up to what fits; centered on the page |
| Exactly fits at *n*× | Uses *n*× |
| Smaller than 320×240 at 1× | Stays **1×**; may clip (no fractional downscale) |

The Pixi renderer stays at 320×240 backing pixels (`Engine` `resolution: 1`); only the CSS box grows or shrinks.

## Constants

Defined in `src/core/display.ts` (also exported from `./core`):

| Constant | Value | Meaning |
| --- | --- | --- |
| `DISPLAY_WIDTH` | 320 | Logical canvas width |
| `DISPLAY_HEIGHT` | 240 | Logical canvas height |
| `PIXEL_GRID` | 16 | Layout snap grid |
| `SPRITE_SIZE` | 32 | Default runtime sprite footprint (2×2 cells) |

Keep `Engine` options, `main.ts`, and `style.css` aligned with these values.

## Rendering

- Default `Engine` resolution is `1` (one backing-store pixel per logical pixel).
- Integer CSS upscale via `displayScale.ts`; `image-rendering: pixelated` on the canvas.
- Pixi textures default to `nearest` via `configurePixelArtRendering()`.
- Disable antialiasing for pixel art (`antialias: false`, the default).
- Sprites still need grid-aligned transforms for perfect screen pixels; CSS integer scale is necessary but not sufficient.

## Assets

- Place files under `public/`; load paths are URL paths (for example `"BeastShip.32x32.png"`).
- Fitted copies often use `name.WxH.png`; originals can remain in repo.
- Art is committed at target sizes under `public/` (320×240 backgrounds, 32×32 sprites, etc.).

## Texture name constants

The engine exports common texture path constants (`TEXTURE_*`, bunny animation constants) from `consts.ts` so levels share one source of truth.

## Collider and render alignment

Graphics components draw in **local space** at the object origin. Position the `TransformComponent` so art and colliders line up with gameplay intent; use debug collider outlines (`Engine` `debug: true`) while tuning.
