# EngineContext

Shared services for everything in a mounted engine. Reach it via `engine.context`, `level.context`, `gameObject.context`, or `component.context`.

## Construction (internal)

Created by `Engine` on mount with stage size and optional `inputTarget` (defaults to `window`).

## Properties

| Property | Type | Role |
| --- | --- | --- |
| `stage` | Pixi `Container` | Root display list |
| `width`, `height` | `number` | Canvas logical size |
| `debug` | `boolean` | Collider debug drawing |
| `time` | `Time` | Delta, pause, scale |
| `input` | `Input` | Keyboard actions |
| `timers` | `Timers` | Scheduled callbacks |
| `collisions` | `CollisionSystem` | Collider registry & pairs |
| `collisionStepper` | `FixedStepper` | Fixed 60 Hz collision consumption |

## Methods

| Method | Description |
| --- | --- |
| `resize(w, h)` | Updates width/height |
| `resetLevelState()` | Clears collisions, timers, stepper (on level destroy) |
| `dispose()` | Detaches input; clears level state |

## Related

- [Services](./services.md)
