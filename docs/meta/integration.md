# Documentation integration

This page describes how to publish these docs as HTML and how a future **visual game editor** can consume the same content.

## Recommended stack: VitePress (included)

| Goal | Approach |
| --- | --- |
| Authoring | Markdown in `docs/` |
| Local preview | `npm run docs:dev` |
| Static HTML | `npm run docs:build` → `docs/.vitepress/dist` |
| Hosting | Upload `dist` to any static host, or `npm run docs:preview` |

VitePress fits the repo because the game already uses **Vite**. The sidebar mirrors the hierarchy in `docs/.vitepress/config.ts`.

### Alternatives (not configured)

| Tool | When to consider |
| --- | --- |
| **TypeDoc** | Auto-generated signatures from TSDoc; pair with narrative docs, not a replacement |
| **Docusaurus** | Larger doc sites with versioning and blog |
| **Custom Vite route** | Embed a markdown viewer inside the game shell |

A practical long-term split: **VitePress for prose + TypeDoc JSON** linked from API pages.

## Machine-readable navigation

[`manifest.json`](./manifest.json) duplicates the doc tree for tools that do not parse VitePress config:

- Editor help panel: load markdown by `path`
- Search index builder
- CI check that manifest paths exist

Each entry includes:

- `id` — stable key for UI state
- `title` — display label
- `path` — path relative to `docs/` (markdown file)
- `kind` — `guide` | `syntax` | `api` | `meta`

## Embedding in a visual editor

Three patterns, from simplest to richest:

### 1. iframe static site

After `docs:build`, serve `docs/.vitepress/dist` beside the editor and point an iframe at `/docs/`. Lowest effort; styling is separate from the editor.

### 2. Fetch markdown + render

At runtime, `fetch('/docs/api/core/game-object.md')` and render with a lightweight markdown library (for example `marked`). Use `manifest.json` to build a sidebar. Keeps one source file; you style help to match the editor.

### 3. Structured blocks (future)

Add YAML frontmatter to pages (`summary`, `symbols`, `since`) and generate JSON chunks for contextual help (“user selected SpawnerComponent → show spawner section”). The manifest can gain optional `symbols: ["SpawnerComponent"]` arrays for lookup.

## Keeping docs honest

1. Treat `src/core/index.ts` as the API boundary when editing [API reference](../api/index.md).
2. When adding exports, add a row to the relevant component page and optionally `manifest.json`.
3. Run `npm run docs:build` in CI alongside `npm run build` if docs are published.

## AGENTS.md

AI agents should read `AGENTS.md` for repo conventions; human docs live here under `docs/`.
