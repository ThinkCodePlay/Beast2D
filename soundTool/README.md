# Beast2D Sound Tool

A standalone PixiJS 8 + TypeScript + Vite canvas starter with a fixed 320 × 240 render resolution. This folder has its own package manifest and does not import the Beast2D engine.

## Structure

- `SoundBoardFrame` is the self-contained board composition. It owns the decorative frame, header, and an empty content slot for board controls.
- `SoundBoardHeader` owns the title bar and icon.
- `BoardFrame` draws the reusable raised cabinet artwork behind those pieces.
- `main.ts` only initializes PixiJS and mounts the board frame.

Add future controls to `frame.content`; the frame handles their placement and keeps them independent from the surrounding engine.

## Run

```sh
cd soundTool
pnpm install
pnpm dev
```

## Verify a production build

```sh
pnpm build
pnpm preview
```
