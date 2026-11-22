# Beast2D Sound Tool

Standalone sound-design board for Beast2D games, in two renderings of one
shared core: a flat 2D board and a 3D cabinet. PixiJS + TypeScript + Vite.

## Layout

- `index.html` + `src/2d/main.ts`: the 2D board. `3d.html` + `src/3d/main.ts`:
  the same board as a 3D scene (cabinet, buttons and dials as meshes).
- `src/shared/`: everything both renderings agree on, edited once:
  - `audio/`: the sound model and playback engine, deliberately free of Pixi
    (`model.ts` is plain data, `SoundPlayer.ts` is UI-free) so export and
    engine integration can reuse it as-is.
  - `dials.ts`: what each of the six dials means - resting value, snap, and
    how a turn writes into the sequence (VOL/PAN/CUT live, RATE/DECAY/PITCH on
    the next Play).
  - `bank.ts`: the sound bank's slots and selection, Pixi-free like the audio
    model. Components subscribe to it; the name LCD and the bank rows follow
    the selection in both renderings.
  - `soundFile.ts`: the import/export JSON format, Pixi-free: one named sound
    per file, validated on the way in.
  - `components/`: the board's panels and controls. Components take a
    `controls` mode: `'2d'` draws and wires the controls, `'3d'` draws flat
    artwork only so the 3D scene can place real meshes on top.
  - `ui/`: reusable pixel buttons, knobs, panel framing, and waveform drawing.
- `src/3d/three/`: the 3D renderer only - cabinet, button/rotor meshes, and
  the control layout that maps board pixels to scene positions.
- `tests/audio.test.ts`: the audio engine's behavior tests (scheduling,
  lifecycle, loop boundaries, dial semantics), run against a mock Web Audio.
- `tests/bank.test.ts`: the sound bank's selection rules (filled slots only,
  arrow-key movement, change notification).
- `tests/soundFile.test.ts`: the sound-file format's round trip and its
  validation and clamping rules.
- The local `public/ui/monogram.ttf` pixel font is loaded before the board is
  drawn; its CC0 license is included alongside it.

The sound bank has sixteen slots beside the creation panel and control
strip, each holding its own sound: notes, waveform and dial settings. Tapping
a filled slot (or pressing the up/down arrow keys) loads its sound into the
editor; the outgoing slot keeps its edits. Empty slots are skipped. The LCD
beside Play/Stop/Loop shows the selected slot's name, and tapping the LCD
opens a name editor (Enter commits, Escape cancels).

Two small buttons on the bank's top strip move one sound at a time: export
downloads the selected slot as an editable JSON file named after it, and
import loads a JSON file into the selected slot (with a confirmation, since
the slot's sound is replaced). Everything else is in memory: nothing persists
across a reload yet, and during playback a switch takes effect on the next
Play, matching the existing snapshot semantics.

## Run

```sh
cd soundTool
pnpm install
pnpm dev        # 2D at /, 3D at /3d.html
```

## Verify a production build

```sh
pnpm build      # typecheck, then both renderers: dist/2d and dist/3d
pnpm preview
```

`pnpm test:audio` runs the audio test suite.
