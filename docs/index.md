# Beast2D documentation

Beast2D is a component-based 2D engine (TypeScript, Vite, PixiJS). These pages describe **how to author games** (syntax and patterns) and the **public engine API** exported from `src/core/index.ts`.

## How this site is organized

| Section | Purpose |
| --- | --- |
| [Guide](./guide/getting-started.md) | Install, first level, mental model |
| [Syntax](./syntax/overview.md) | Authoring patterns: levels, objects, composition |
| [API reference](./api/index.md) | Classes, methods, and component catalogs |
| [Meta](./meta/integration.md) | Building HTML, editor integration, manifest |

## Quick links

- [Getting started](./guide/getting-started.md)
- [Core concepts](./guide/concepts.md)
- [Display spec (320×240)](./guide/display-spec.md)
- [Level lifecycle](./syntax/levels-and-lifecycle.md)
- [GameObject & components](./syntax/game-objects-and-components.md)
- [Cart mode](./syntax/cart.md)
- [Engine](./api/core/engine.md)
- [Component index](./api/components/index.md)

## Source of truth

- Narrative docs: `docs/**/*.md`
- Machine nav for tools: [`docs/meta/manifest.json`](./meta/manifest.json)
- TypeScript API surface: `src/core/index.ts`

Run the documentation site locally:

```bash
pnpm run docs:dev
```

Build static HTML (for hosting or embedding):

```bash
pnpm run docs:build
```

Output directory: `docs/.vitepress/dist`.
