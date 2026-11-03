# Display spec

Beast2D targets a fixed **320×240** virtual resolution (4∶3), scaled in CSS for crisp pixel art.

## Constants

Defined in `src/core/consts.ts` (also exported from `./core`):

| Constant | Value | Meaning |
| --- | --- | --- |
| `DISPLAY_WIDTH` | 320 | Logical canvas width |
| `DISPLAY_HEIGHT` | 240 | Logical canvas height |
| `PIXEL_GRID` | 16 | Layout snap grid |
| `SPRITE_SIZE` | 32 | Default runtime sprite footprint (2×2 cells) |

Keep `Engine` options, `main.ts`, and `style.css` aligned with these values.

## Rendering

- Default `Engine` resolution is `1` (one backing-store pixel per logical pixel).
- CSS typically scales the canvas **2×** (640×480) with `image-rendering: pixelated`.
- Disable antialiasing for pixel art (`antialias: false`, the default).

## Assets

- Place files under `public/`; load paths are URL paths (for example `"BeastShip.32x32.png"`).
- Fitted copies often use `name.WxH.png`; originals can remain in repo.
- Fit tool: `npm run assets:fit-display` (see `scripts/compress_display_png.py`).

## Texture name constants

The engine exports common texture path constants (`TEXTURE_*`, bunny animation constants) from `consts.ts` so levels share one source of truth.

## Collider and render alignment

Graphics components draw in **local space** at the object origin. Position the `TransformComponent` so art and colliders line up with gameplay intent; use debug collider outlines (`Engine` `debug: true`) while tuning.
