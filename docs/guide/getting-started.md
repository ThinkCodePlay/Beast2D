# Getting started

## Prerequisites

- Node.js (LTS recommended)
- npm

## Install and run

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). Levels registered in `src/main.ts` determine what loads.

## Other commands

| Command | Description |
| --- | --- |
| `npm run build` | Type-check (`tsc`) + production game build |
| `npm run typecheck` | TypeScript only |
| `npm test` | Vitest (`tests/`) |
| `npm run preview` | Preview production build |
| `npm run docs:dev` | Documentation dev server |
| `npm run docs:build` | Static documentation site |

## Minimal level

Import from `./core` (or your project’s alias). Subclass `Level`, populate `levelRoot` in `init()`, and call `super.update(dt)` in `update()`.

```ts
import { Engine, Level, Box, UserInputComponent } from "./core";

class MyLevel extends Level {
  protected init() {
    this.levelRoot.addChild(
      new Box(100, 100, 32, 32).with(new UserInputComponent(4)),
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
