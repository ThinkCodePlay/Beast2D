# Core concepts

## Scene graph: GameObject

Every entity is a **GameObject**: a Pixi `Container` plus optional **components** and **children**. Transforms compose through the parent chain; use `getWorldPosition()` for world space.

## Components

Behavior is split into attachable **components** (movement, render, collision, input, and so on). One instance per **component class** per object; `getComponent(BaseClass)` finds subclasses.

### Lifecycle

| Hook | When |
| --- | --- |
| `onInit()` | Once, on the first update of the owner, **after** all components on that object exist |
| `update(dt)` | Every frame while `enabled` and not destroyed |
| `onDestroy()` | Once when removed or when the owner is destroyed; only if `onInit` ran |

`addComponent()` only registers. Initialization is deferred until the object is updated inside an active level.

### Destroying

Call `gameObject.destroy()` from anywhere (including inside `update` or collision callbacks). The object detaches immediately; component `onDestroy` runs at **end of frame** via `GameObject.flushDestroyed()` (called from `Level.tick`).

Do **not** override `destroy()` on `GameObject`; override protected `onDestroy()` for object-level cleanup.

## Transform

`TransformComponent` holds local position, rotation, and scale. The engine applies it to the container **after** updates (`syncTransforms`). Render and collider graphics are drawn at the object origin; children inherit the parent transform.

Spawn world-space objects (bullets, particles) under **`levelRoot`**, not under a moving parent, unless you intentionally want local offsets.

## EngineContext

Once an object is part of a level, `gameObject.context` (and `component.context`) expose shared services:

- `time` — delta, pause, time scale
- `input` — named actions
- `timers` — delayed and repeating callbacks on game time
- `collisions` — broadphase and collision resolution
- `stage`, `width`, `height`, `debug`

Use `requireContext()` in components when absence is a programming error. `Globals` is a thin facade for values needed before an object is in a level (for example prefab constructors).

## Time units

`update(dt)` receives **frame units**: `1` ≈ one sixtieth of a second at the engine’s logical rate. For seconds, use:

```ts
const seconds = this.requireContext().time.deltaSeconds;
```

Collisions run on a **fixed 60 Hz** step independent of display refresh (`collisionStepper` on the context).

## Pause

`game.pause()` sets `time.paused`. Most objects stop updating; objects with `runWhenPaused = true` (for example `levelRoot` and UI) keep updating. Rendering continues.

## Levels

A **level** owns `levelRoot` on the Pixi stage. Register levels on `GameManager`, preload `level.assets`, then `loadLevel(name)`. Switching during a tick is deferred to the end of the tick.

## Public API boundary

Only symbols exported from `src/core/index.ts` are considered stable engine API. Game-specific code under `src/game/` illustrates patterns but is not part of the engine contract.
