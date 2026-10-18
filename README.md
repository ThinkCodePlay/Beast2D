# Beast2D

A small component-based 2D engine on top of PixiJS (TypeScript + Vite).

```bash
npm install
npm run dev        # dev server
npm run build      # type-check + production build
npm run typecheck  # tsc only
npm test           # Vitest
```

## Quick start

```ts
import { Engine, Level, Box, UserInputComponent } from "./core";

class MyLevel extends Level {
  protected init() {
    this.levelRoot.addChild(new Box(100, 100, 50, 50).with(new UserInputComponent(4)));
  }
  protected update(dt: number) {
    super.update(dt); // always call super first
  }
}

const engine = new Engine({ width: 800, height: 600 });
const game = await engine.bootstrap(document.body);
game.registerLevel("main", new MyLevel(engine));
await game.loadLevel("main");
```

## Concepts

- **GameObject**: scene-graph node wrapping a Pixi `Container`. Holds components, children and a world position.
- **Component** lifecycle, three hooks only:
  - `onInit()` once, on the first update of its object, after all components were added (siblings can be looked up).
  - `update(dt)` every frame. `dt` is in frame units (1 = 1/60 s). Use `context.time.deltaSeconds` for seconds.
  - `onDestroy()` once, when removed or when the object is destroyed (only if `onInit` ran).
- **Destroying**: `gameObject.destroy()` is safe anywhere (also inside `update` and collision callbacks). The object is detached immediately; teardown (`onDestroy`) happens at the end of the frame. `GameObject` subclasses can override `onDestroy()` for object-level cleanup.
- **TransformComponent**: local position/rotation/scale. The engine applies it to the object's container after all updates, so children inherit it. Use `getWorldPosition()` / `localToWorld()` for world space. Render graphics are drawn at the object origin.
- **Components are looked up by class**: `getComponent(Collider)` also finds subclasses. One component per class per object.
- **EngineContext** (`gameObject.context`, `component.context`): `time`, `input`, `timers`, `collisions`, `stage`, `width`, `height`, `debug`. Available once the object is part of a level; `Globals` is a thin static facade for code that runs before that (e.g. prefab constructors).
- **Input**: named actions (`left`, `right`, `up`, `down`, `shoot`, plus your own via `input.bind`). Keys are tracked by `KeyboardEvent.code`; keys are released on window blur.
- **Collisions**: `CollisionSystem` (grid broadphase, deterministic order, fixed 60 Hz). Colliders have `layer`, `mode` (active/passive/both), `mask` and `onCollisionEnter/Stay/Exit`.
- **Time / pause**: `GameManager.pause()` freezes game time (delta 0). Objects with `runWhenPaused = true` (UI) keep updating; rendering continues. `time.timeScale` gives slow motion. `context.timers.after/every` schedule callbacks on game time.
- **Levels**: the game registers its levels (see `src/main.ts`). `level.assets` lists assets preloaded before `init()`. Switching levels while a level is ticking is deferred to the end of the tick.
- **Pointer events**: `InteractiveComponent({ onClick, onHoverStart, onHoverEnd })`.
- **Pooling**: `ObjectPool<T>` is a generic helper. Destroyed `GameObject`s cannot be reused; pool lightweight data or recreate objects.

Everything public is exported from `src/core/index.ts`.
