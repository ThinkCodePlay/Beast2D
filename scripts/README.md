# Scripts

Offline tooling for shared HUD UI — **not** wired in `package.json` (engine scripts are dev/build/test/docs only).

## Regenerate `public/ui/` + bitmap font

Writes HUD chrome PNGs and `src/core/ui/defaultBitmapFont.ts`:

```bash
npx tsx scripts/generate-beast2d-ui.ts
```

Uses `scripts/pixel/` (palette + PNG writer). Shipped assets in `public/ui/` and the generated TypeScript are the source of truth at runtime.

See **Temporary demo tooling** in [`AGENTS.md`](../AGENTS.md).
