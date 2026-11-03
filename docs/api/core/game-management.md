# Game management

## GameManager

Facade returned from `engine.bootstrap()`.

| Method / property | Description |
| --- | --- |
| `registerLevel(name, level)` | Register a `Level` instance |
| `loadLevel(name)` | `Promise<void>` — preload assets, switch level |
| `getCurrentLevel()` | Active `Level` or `null` |
| `pause()` / `resume()` | Game time pause |
| `paused` | Boolean |
| `tick(dt)` | Called by engine (do not call from game code) |

## LevelManager

Used internally by `GameManager`. Useful to understand behavior:

| Behavior | Detail |
| --- | --- |
| Asset preload | `await Assets.load(level.assets)` before switch |
| Concurrent loads | Latest `loadLevel` token wins |
| Mid-tick switch | Deferred until after current tick |

## Related

- [Level](./level.md)
- [Levels and lifecycle](../../syntax/levels-and-lifecycle.md)
