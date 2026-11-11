# Syntax overview

Beast2D has no separate scripting language: you write **TypeScript** that composes **levels**, **GameObjects**, and **components**. The “syntax” here is the set of conventions the engine expects.

## Authoring stack

```
Engine.bootstrap → GameManager.registerLevel / loadLevel
       ↓
Level.init() → build graph under levelRoot
       ↓
Level.update(dt) → super.update(dt) → components + children
       ↓
Level.tick (engine) → collisions, syncTransforms, timers, flushDestroyed
```

## Composition styles

### Prefab constructor

Bundled objects set transform + default components in the constructor:

```ts
const player = new Box(x, y, w, h);
```

### Fluent `.with()`

Attach extra components when constructing:

```ts
new Box(0, 0, 32, 32)
  .with(new UserInputComponent(5))
  .with(new SquareColliderComponent({ mode: ColliderModes.Active }));
```

### Cart mode

A cart can also be one module with `init`, `update(dt)`, and `draw`, using `cls`, `rectfill`, `print`, and `btn`. See [Cart mode](./cart.md). Component levels stay available when a game needs objects.

### Subclass GameObject

Game-specific types (see `BunnyPlayer`, `Player`) call `addComponent` in the constructor and may override `onDestroy()`.

## Imports

Public engine API:

```ts
import {
  Engine,
  Level,
  GameObject,
  Component,
  Box,
  ColliderModes,
  CollisionLayers,
} from "./core";
```

Path aliases depend on your Vite/TS config; game code typically uses relative paths into `src/core`.

## File layout convention

| Location | Role |
| --- | --- |
| `src/core/` | Engine (stable API) |
| `src/core/components/<domain>/` | Reusable behaviors |
| `src/core/prefabs/` | Constructor-configured objects |
| `src/game/<Game Name>/` | Levels and game-specific objects |

## Related pages

- [Levels and lifecycle](./levels-and-lifecycle.md)
- [GameObjects and components](./game-objects-and-components.md)
- [Prefabs and composition](./prefabs-and-composition.md)
