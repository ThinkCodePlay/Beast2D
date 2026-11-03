# Constants

Exported from `./core` (`src/core/consts.ts`).

## Display

| Name | Value |
| --- | --- |
| `DISPLAY_WIDTH` | 320 |
| `DISPLAY_HEIGHT` | 240 |
| `PIXEL_GRID` | 16 |
| `SPRITE_SIZE` | 32 |

## Textures (path constants)

Examples: `TEXTURE_BEAST_SHIP`, `TEXTURE_HEART`, `TEXTURE_BUNNY_WALK_ANIMATION`, `TEXTURE_STARS_LAYER_1`, …

Bunny animation helpers: `BUNNY_SPRITE_SIZE`, `BUNNY_WALK_ANIMATION_COLUMNS`, `BUNNY_WALK_ANIMATION_FRAME_COUNT`.

## ObjectNames

`LevelRoot`, `GameObject`, `BoxObject`, `CircleObject` — default debug names.

## ColliderModes

| Value | Meaning |
| --- | --- |
| `active` | Moves and generates contacts |
| `passive` | Can be hit; does not drive broadphase as active |
| `both` | Active and passive roles |

## CollisionLayers

`default`, `bullet`, `enemy`, `player` — used with `mask` on colliders.

## Related

- [Display spec](/guide/display-spec)
- [Collision components](/api/components/collision)
