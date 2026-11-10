# Getting started

## Prerequisites

- Node.js (LTS recommended)
- pnpm (enable via [Corepack](https://nodejs.org/api/corepack.html): `corepack enable`, or install from [pnpm.io](https://pnpm.io/installation))

## Install and run

```bash
pnpm install
pnpm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). Levels registered in `src/main.ts` determine what loads.

## Other commands

| Command | Description |
| --- | --- |
| `pnpm run build` | Type-check (`tsc`) + production game build |
| `pnpm run typecheck` | TypeScript only |
| `pnpm test` | Vitest (`tests/`) |
| `pnpm run preview` | Preview production build |
| `pnpm run docs:dev` | Documentation dev server |
| `pnpm run docs:build` | Static documentation site |

## Minimal level

Import from `./core` (or your project’s alias). Subclass `Level`, populate `levelRoot` in `init()`, and call `super.update(dt)` in `update()`.

```ts
import { Engine, Level, Box, Movement, KeyboardMovement } from "./core";

class MyLevel extends Level {
  protected init() {
    this.levelRoot.addChild(
      new Box(100, 100, 32, 32).with(new Movement(4)).with(new KeyboardMovement()),
    );
  }

  protected update(dt: number) {
    super.update(dt);
  }
}

const engine = new Engine();
const game = await engine.bootstrap(document.body);
game.registerLevel("main", new MyLevel(engine));
await game.loadLevel("main");
```

## Where examples live

| Path | Content |
| --- | --- |
| `src/game/Level1`, `Level2` | Small demos |
| `src/game/Space Shooter/` | Full gameplay sample |
| `src/game/Bunny Hop/` | Spritesheet animation sample |

## Next steps

1. Read [Core concepts](./concepts.md) for lifecycle and time units.
2. Read [Display spec](./display-spec.md) before adding art.
3. Use the [Syntax overview](../syntax/overview.md) when building prefabs and levels.
