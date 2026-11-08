# Scripts

> **Lifecycle:** Asset fit/generator scripts here are temporary while demo levels are being built. Remove them (and committed outputs stay in `public/`) once demos are finished — see **Temporary demo tooling** in [`AGENTS.md`](../AGENTS.md).

## `compress_display_png.py`

Fits PNGs to the game display (or a custom size) using **nearest-neighbor** downsampling. Writes **`{stem}.{width}x{height}.png`** next to each source file unless you pass `--output-dir` or `--in-place`.

**Setup**

```bash
pip install -r devtools/assets/requirements.txt
```

**Common commands**

| Goal | Command |
|------|---------|
| All background layers | `npm run assets:fit-display` |
| One file → 320×240 copy | `python devtools/assets/compress_display_png.py public/background/layer.png` |
| Ship / UI → 32×32 copy | `python devtools/assets/compress_display_png.py --width 32 --height 32 public/BeastShip.png` |
| Sprite sheet (12×12 @ 32px) | `python devtools/assets/compress_display_png.py --width 384 --height 384 public/bunny-move-animation.png` |
| Preview only | add `--dry-run` |
| Overwrite source | add `--in-place` |

After generating fitted sprites, point `TEXTURE_*` in `src/core/consts.ts` at the new filenames (e.g. `BeastShip.32x32.png`).

Full option list:

```bash
python devtools/assets/compress_display_png.py --help
```

Display width/height defaults match `DISPLAY_WIDTH` / `DISPLAY_HEIGHT` in `src/core/consts.ts` (keep in sync with the script constants at the top of the file).
