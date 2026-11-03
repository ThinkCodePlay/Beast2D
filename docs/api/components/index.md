# Components

All components extend `Component` and attach to a `GameObject` via `addComponent` or `.with()`.

## Component base

| Field | Description |
| --- | --- |
| `gameObject` | Owner (set by engine) |
| `enabled` | Skip `update` when false |
| `context` | `EngineContext` or null |

| Method | Description |
| --- | --- |
| `onInit()` | Override — once before first update |
| `update(dt)` | Override — per frame |
| `onDestroy()` | Override — teardown |
| `protected requireContext()` | Throws if not in a level |

## Catalog by domain

| Page | Components |
| --- | --- |
| [Movement](./movement.md) | Transform, UserInput, HorizontalInput, HorizontalClamp, HorizontalFacing, VerticalMove |
| [Render](./render.md) | Render base, Box/Circle/Sprite, Spritesheet animation, Parallax background |
| [Collision](./collision.md) | Collider base, Circle, Square |
| [Input & behavior](./input-behavior.md) | Interactive, SpaceShoot, Spawner, locomotion animation, destroy bounds |

## UI in sample games

`HeartsUI`, `ScoreUI`, `DialogUI` and their render helpers live under `src/core/components/UI/` but are **not** exported from `src/core/index.ts` today. Treat them as game-adjacent references until promoted to the public API.

## RenderOptions

Shared by render components (`RenderComponent`):

```ts
interface RenderOptions {
  color?: number;
  alpha?: number;
  visible?: boolean;
}
```

## Related

- [GameObject](../core/game-object.md)
- [Syntax: components](../../syntax/game-objects-and-components.md)
