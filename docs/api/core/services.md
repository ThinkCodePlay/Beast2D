# Services

Services live on `EngineContext`. Components should prefer `this.requireContext()` over `CanvasSize` during gameplay.

## Time

Export: `Time`, `FRAMES_PER_SECOND`.

| Field / method | Description |
| --- | --- |
| `deltaSeconds` | Last frame duration in seconds |
| `paused` | Game time frozen when true |
| `timeScale` | Multiplier on delta (slow motion) |

Frame argument `dt` in `update(dt)` is in **frame units** (`1 / FRAMES_PER_SECOND` seconds per unit at nominal rate).

## Input

Export: `Input`, `DefaultBindings`.

Default actions: `left`, `right`, `up`, `down`, `shoot` (see `DefaultBindings` for key codes).

| Method | Description |
| --- | --- |
| `bind(action, codes)` | Map action → `KeyboardEvent.code` values |
| `isDown(action)` | Held this frame |
| `wasPressed(action)` | Edge press |
| `wasReleased(action)` | Edge release |
| `isKeyDown(code)` | Raw code |
| `attach(target)` / `detach()` | Event target (engine attaches window) |

Keys release on window blur.

## Timers

Export: `Timers`, `TimerHandle`.

| Method | Description |
| --- | --- |
| `after(seconds, fn)` | One-shot on game time |
| `every(seconds, fn)` | Repeating |
| `clear(handle)` | Cancel |

Updated from `Level.tick` using `deltaSeconds` (respects pause via time service).

## CollisionSystem

Export: `CollisionSystem`.

Collider components register on init. The system:

- Uses spatial grid broadphase
- Runs at fixed 60 Hz via `collisionStepper`
- Invokes `onCollisionEnter` / `Stay` / `Exit` on `ColliderComponent`

See [Collision components](../components/collision.md).

## FixedTick

Export: `FixedTick`.

Accumulates frame `dt` and returns how many fixed steps to run. Used for deterministic collision.

## Related

- [Constants](../constants.md) — `CollisionLayers`, `ColliderModes`
