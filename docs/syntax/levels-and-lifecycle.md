# Levels and lifecycle

## Define a level

```ts
import { Level } from "./core";

export class BunnyHop extends Level {
  /** Preloaded by LevelManager before start() */
  assets = ["bunny-walk-animation.64x64.png"];

  protected init() {
    // this.levelRoot is ready; add children here
  }

  protected update(dt: number) {
    super.update(dt); // required: runs object updates
    // optional level logic after the graph updates
  }
}
```

## Register and load

In `main.ts` (or your bootstrap):

```ts
game.registerLevel("bunny", new BunnyHop(engine));
await game.loadLevel("bunny");
```

`loadLevel`:

1. Loads `level.assets` via Pixi `Assets.load`
2. Destroys the previous level (if any)
3. Calls `level.start()` → creates `levelRoot`, runs `init()`

If `loadLevel` is called again while assets load, the **latest** request wins.

## What `tick` does each frame

Called by the engine on the active level (you do not call this from game code):

1. `update(dt)` on the level (your override → `levelRoot.update`)
2. Fixed-step collision pass when not paused
3. `levelRoot.syncTransforms()`
4. Timer service update
5. `GameObject.flushDestroyed()`

## Switching levels

Safe at any time. If a switch is requested mid-tick, it applies **after** the current tick completes.

## Pause

```ts
game.pause();
game.resume();
// game.paused
```

UI roots often set `runWhenPaused = true` on themselves or use `levelRoot` (already paused-resistant for structure).

## Assets list

Only paths needed before `init()` should appear in `assets`. Components that load textures asynchronously may still call `Assets.load` themselves; listing paths here avoids pop-in on first frame.
