# Level

Abstract base class for a scene. Subclasses implement `init()`; may override `update(dt)`.

## Constructor

```ts
constructor(engine: Engine)
```

## Fields

| Field | Description |
| --- | --- |
| `assets` | `string[]` URL paths preloaded before `start()` |

## Protected API

| Member | Description |
| --- | --- |
| `engine` | Owning engine |
| `levelRoot` | Root `GameObject` (created in `start()`) |
| `showHud` | When `false`, `start()` skips the lives/score band. Default `true`. |
| `context` | `engine.context` |
| `init()` | **abstract** — build scene |
| `update(dt)` | Default forwards to `levelRoot.update`; call `super.update(dt)` first when overriding |

## Public lifecycle

| Method | Description |
| --- | --- |
| `start()` | Creates `levelRoot`, sets context, calls `init()` |
| `destroy()` | Destroys graph, flushes destroyed objects, resets level context state |
| `tick(dt)` | Engine frame: update, collisions, transforms, timers, flush |

## Introspection

| Method | Description |
| --- | --- |
| `getHierarchy()` | Scene tree from `levelRoot` |

## Notes

- `levelRoot.runWhenPaused` is `true` so structure persists while paused.
- Do not call `tick` from game code.

## Related

- [Levels and lifecycle (syntax)](../../syntax/levels-and-lifecycle.md)
