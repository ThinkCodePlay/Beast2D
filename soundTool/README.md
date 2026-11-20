# Beast2D Sound Tool

A standalone PixiJS 8 + TypeScript + Vite sound-board interface. The canvas is fixed at 1536 × 1024, with the pixel-art controls composed on a 512 × 341⅓ design grid.

This branch renders the board with PixiJS 3D (`@pixi/3d`): the cabinet, buttons and rotary knobs are 3D meshes, while every sprite and flat surface stays 2D, drawn onto the 3D surfaces through live container textures.

## Structure

- `src/main.ts` initializes PixiJS at the fixed canvas size, sets up the 3D view and camera, and mounts the board. Pass `?renderer=webgl` to force the WebGL2 backend.
- `SoundBoardFrame` places the cabinet frame, header, navigation tabs, editor and bank panels, shared control strip, and keyboard-help footer.
- `SoundCreationPanel` contains transport controls, the named sound, preset pads, and waveform.
- `SoundBankPanel` contains the twelve sound slots and scroll controls.
- `SoundControlStrip` contains the six parameter knobs and the waveform edit button.
- `src/ui/` contains reusable pixel buttons, knobs, panel framing, and waveform drawing.
- `src/three/` contains the 3D scene: `SoundBoardScene3D` composes the cabinet and controls, `Button3D` and `Knob3D` wrap each control's 2D face artwork in a 3D body, `controlLayout` derives every control's placement from the panels' layout constants, and `boardSpace` maps the design grid onto the 3D world.
- Panels take a `ControlMode`: `'2d'` draws controls flat (the classic look), `'3d'` leaves them out so the 3D scene can place meshes there instead.
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
