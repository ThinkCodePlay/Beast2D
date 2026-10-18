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
- Type-check only: `npm run typecheck`
- Tests: `npm test` (Vitest, `tests/`)
- Preview build: `npm run preview`

Notes:
- There is no lint script in `package.json`.
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
- Keep level-specific setup in `Level.init()` and per-frame logic in `Level.update(dt)`.

## Component Lifecycle

Components have three hooks: `onInit()`, `update(dt)`, `onDestroy()` (see `README.md`).
- `addComponent` only registers; `onInit` runs once on the first update of the owning `GameObject`, after all its components are added (siblings are available).
- `GameObject.destroy()` is idempotent and safe inside `update`/callbacks: it detaches immediately; `onDestroy` of components (and the object's own protected `onDestroy()`) run at the end of the frame via `GameObject.flushDestroyed()` (called by `Level.tick`). Component `onDestroy` only runs if `onInit` ran. Do not override `destroy()`, override `onDestroy()`.
- `update(dt)` uses frame units (1 = 1/60 s). Seconds: `context.time.deltaSeconds`.

## Repo Gotchas

- Paths with spaces exist and are valid (for example `src/game/Space Shooter/` and nested `Game Objects/`). Keep import paths exact.
- Components are keyed by class reference; adding a second component of the same class returns the existing one. `getComponent(Base)` finds subclasses.
- `TransformComponent` drives the GameObject container (applied after updates). Render/collider graphics are drawn at the object origin. Children inherit the parent transform, so spawn world-space objects (bullets) into the level root (`this.root`), not under a moving parent.
- Components needing engine services use `this.requireContext()` (throws if the object is not in a level). `Globals` is only a facade for construction-time values like canvas size.
- Levels override `update(dt: number)` (call `super.update(dt)`), not a ticker callback. The game registers its levels in `src/main.ts`.
- `GameObject.getWorldPosition()` composes parent transforms.

## Safe Change Workflow

1. Start from an existing nearby prefab/component/level and mirror its style.
2. Make minimal changes in the relevant domain folder (`core/components`, `core/prefabs`, or `game/...`).
3. Run `npm test` and `npm run build` before finishing.
4. If you introduce new behavior, ensure it is wired through level setup (`init`) and that teardown uses `destroy()` patterns already in use.

## Documentation Status

- `README.md` documents the engine concepts; this file is the quick-start guide for agents.
