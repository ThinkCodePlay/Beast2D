# Beast2D Sound Tool

A standalone PixiJS 8 + TypeScript + Vite sound-board interface. The canvas is fixed at 1536 × 1024, with the pixel-art controls composed on a 512 × 341⅓ design grid and rendered at 3× scale.

## Structure

- `src/main.ts` initializes PixiJS at the fixed canvas size and mounts the board.
- `SoundBoardFrame` places the cabinet frame, header, navigation tabs, editor and bank panels, shared control strip, and keyboard-help footer.
- `SoundCreationPanel` contains transport controls, the named sound, preset pads, the waveform display, and the waveform selector row.
- `SoundBankPanel` contains the twelve sound slots and scroll controls; it runs the full height beside the creation panel and control strip.
- `SoundControlStrip` contains the six parameter knobs.
- `src/ui/` contains reusable pixel buttons, knobs, panel framing, and waveform drawing.
- The local `public/ui/monogram.ttf` pixel font is loaded before the board is drawn; its CC0 license is included alongside it.

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
