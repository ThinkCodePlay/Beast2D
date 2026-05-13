# AGENTS.md

Guidance for AI coding agents working in this repository.

## Project Snapshot

- Tech stack: TypeScript + Vite + PixiJS
- Primary source root: `src/`
- Entry point: `src/main.ts`
- Engine architecture: scene-graph `GameObject` + attachable `Component` system

## Runbook

- Install: `npm install`
- Dev server: `npm run dev`
- Build (also type-checks): `npm run build`
- Preview build: `npm run preview`

Notes:
- There are no dedicated test or lint scripts in `package.json`.
- TypeScript is strict; expect `noUnusedLocals` and `noUnusedParameters` errors.

## Where To Start Reading

1. `src/main.ts` (bootstrap)
2. `src/core/Engine.ts` (Pixi app + ticker loop)
3. `src/core/GameObject.ts` (scene graph + component registry)
4. `src/core/Level.ts` (level lifecycle)
5. `src/core/components/Component.ts` (component base)
6. `src/game/Space Shooter/SpaceShooter.ts` (feature-complete level example)

## Architecture Map

- `src/core/`
- `Engine.ts`: canvas/app setup and update loop
- `GameManager.ts` + `LevelManager.ts`: level registration/loading/active state
- `Level.ts`: base class with `init`/`update`
- `GameObject.ts`: parent/child graph, Pixi container ownership, component lifecycle
- `components/`: behavior split by domain (Render, Movement, Collision, Input, UI, Behavior)
- `prefabs/`: constructor-configured reusable objects (`Box`, `Circle`, `Player`, `Spawner`)

- `src/game/`
- Playable content and examples (`Level1`, `Level2`, and `Space Shooter`)

## Conventions To Follow

- Prefer prefab-style composition over large monolithic objects.
- Use constructor-driven configuration (values passed at object construction time).
- Compose behavior with components via `addComponent(...)`.
- Use `getRequiredComponent(...)` when absence is a programming error; use `getComponent(...)` when optional.
- Keep level-specific setup in `Level.init()` and per-frame logic in `Level.update()`.

## Repo Gotchas

- Paths with spaces exist and are valid (for example `src/game/Space Shooter/` and nested `Game Objects/`). Keep import paths exact.
- `GameObject` deduplicates components by class name; adding a duplicate returns the existing instance.
- Many render/collision flows assume a `TransformComponent` exists on the same `GameObject`.
- `Globals.stage` access before engine initialization throws.
- `GameObject.getWorldPosition()` is currently a stub.

## Safe Change Workflow

1. Start from an existing nearby prefab/component/level and mirror its style.
2. Make minimal changes in the relevant domain folder (`core/components`, `core/prefabs`, or `game/...`).
3. Run `npm run build` before finishing.
4. If you introduce new behavior, ensure it is wired through level setup (`init`) and that teardown uses `destroy()` patterns already in use.

## Documentation Status

- No `README.md`, `CONTRIBUTING.md`, or `docs/` markdown docs are currently present.
- Treat this file as the quick-start guide for agent behavior in this repository.
