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
  - `presets.ts`: the six preset sounds behind the creation panel's pads,
    Pixi-free so both renderings and the tests share them.
  - `bankStorage.ts`: the localStorage snapshot format (all slots, selection,
    loop latch), Pixi-free; stored sounds share the sound file's validation.
  - `bankFile.ts`: the whole-bank file format behind the bank strip's bank
    import/export buttons; the snapshot envelope, pretty-printed for hand
    editing.
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
- `tests/presets.test.ts`: the preset definitions (valid playable sequences,
  export round trip) and the apply-then-undo flow.
- `tests/bankStorage.test.ts`: the snapshot's round trip, selection clamping
  and corruption rejection.
- `tests/bankFile.test.ts`: the whole-bank file's round trip, its shared
  envelope with the snapshot and its rejection wording.
- The local `public/ui/monogram.ttf` pixel font is loaded before the board is
  drawn; its CC0 license is included alongside it.

The sound bank has sixteen slots beside the creation panel and control
strip, each holding its own sound: notes, waveform and dial settings. Tapping
a filled slot (or pressing the up/down arrow keys) loads its sound into the
editor; the outgoing slot keeps its edits. Empty slots are skipped. The LCD
beside Play/Stop/Loop shows the selected slot's name, and tapping the LCD
opens a name editor (Enter commits, Escape cancels).

The bank's last row is a persistent "+ new" row that adds a sound: it fills
the first empty placeholder, or grows the bank once every slot is filled -
there is no cap. The new slot gets the standard demo sound and an automatic
name (renameable on the LCD), becomes the selection and scrolls into view.
The bank panel shows fifteen slots at a time beside "+ new"; the scrollbar
steps or drags the window (the mouse wheel works too), its thumb sizing to
the visible share. In 3D the arrow buttons scroll and the thumb follows on
its overlay.

The six preset pads on the creation panel load ready-made game sounds - coin,
power-up, jump, explosion, hit and enemy death - into the selected slot,
replacing its sound and name, and play the new sound once.

Small buttons on the bank's top strip move sounds in and out and recover
mistakes: export downloads the selected slot as an editable JSON file named
after it, import loads a JSON file into the selected slot (with a
confirmation, since the slot's sound is replaced), and undo restores the
sound and name the last replacement - preset or import - overwrote, also via
Ctrl/Cmd+Z. Undo keeps the newest ten replacements. The leftmost pair backs
up and restores the whole bank at once: bank export downloads every slot,
the selection and the loop latch as one pretty-printed JSON file, and bank
import restores such a file after a confirmation, since every current sound
is replaced. A cancelled picker or dialog changes nothing, and an invalid
file is rejected with the reason, leaving the bank untouched.

The board saves itself to the browser's localStorage every few seconds and
when the page hides: every slot's name and sound, the selection and the loop
latch, under one namespaced versioned key. A snapshot that fails validation
is never silently overwritten - its raw text is copied to a timestamped
backup key and the board starts fresh with a notice. localStorage is scoped
to the origin, not the path, so a snapshot written at one commit-pinned
GitHack URL loads at the next one. During playback a switch takes effect on
the next Play, matching the existing snapshot semantics.

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

## Code checks

Tooling is local to `soundTool/`; these commands do not format the engine at
the repository root. ESLint checks source, tests and configuration. Prettier
uses double quotes and skips generated builds, compiled tests and the pnpm
lockfile. The existing Node test runner is unchanged.

```sh
pnpm typecheck
pnpm lint
pnpm format:check
pnpm test:audio
pnpm build
```

Use `pnpm format` to format the sound tool before committing.
