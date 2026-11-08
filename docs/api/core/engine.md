# Engine

`Engine` owns the Pixi `Application`, constructs `EngineContext`, and drives `GameManager.tick` from the Pixi ticker.

## Construction

```ts
const engine = new Engine({
  width?: number;           // default DISPLAY_WIDTH (320)
  height?: number;          // default DISPLAY_HEIGHT (240)
  backgroundColor?: number | string;
  antialias?: boolean;      // default false
  debug?: boolean;          // collider outlines; default true
  resolution?: number;      // default 1 for pixel art
});
```

## Bootstrap

```ts
const game = await engine.bootstrap(domElement);
// alias: await engine.mount(domElement) then access gameManager
```

After bootstrap:

- Canvas is attached to `domElement`
- `engine.context` is available
- `engine.gameManager` is defined

## Properties

| Member | Description |
| --- | --- |
| `app` | Pixi `Application` |
| `gameManager` | Level registration and pause |
| `context` | `EngineContext` (throws if not mounted) |

## Global debug hook

Capture Vite entries under `devtools/levels/*/capture/` call `exposePixiAppForCapture` so `globalThis.__PIXI_APP__` is available for Pixi browser extensions during dev screenshots. The default `index.html` boot path does not set it.

## Related

- [EngineContext](./engine-context.md)
- [Game management](./game-management.md)
