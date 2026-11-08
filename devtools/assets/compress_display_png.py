"""
Fit PNG bitmaps to the Beast2D virtual display (default 320x240).

Downscales with nearest-neighbor (good for pixel art). By default writes a
copy next to the source (e.g. stars.png -> stars.320x240.png) and leaves
the original untouched. Requires Pillow:

  pip install -r devtools/assets/requirements.txt

Keep DISPLAY_WIDTH / DISPLAY_HEIGHT in sync with src/core/consts.ts.

Examples:
  # Fit backgrounds; copies land beside each source PNG
  python devtools/assets/compress_display_png.py --backgrounds
  npm run assets:fit-display

  # One full-screen layer (default 320x240 copy)
  python devtools/assets/compress_display_png.py public/background/huge-stars.png

  # Sprites (then wire paths in src/core/consts.ts TEXTURE_*)
  python devtools/assets/compress_display_png.py --width 32 --height 32 public/BeastShip.png
  python devtools/assets/compress_display_png.py --width 384 --height 384 public/bunny-move-animation.png

  # Custom size
  python devtools/assets/compress_display_png.py --width 320 --height 240 my.png

  # All outputs into one folder
  python devtools/assets/compress_display_png.py --output-dir public/background/fitted huge-stars.png

  # Overwrite sources instead of writing a copy
  python devtools/assets/compress_display_png.py --in-place public/background/huge-stars.png

  # Preview
  python devtools/assets/compress_display_png.py --dry-run public/background/*.png

  # Replace procedural star placeholders (writes game filenames in public/background/)
  python devtools/assets/compress_display_png.py --regenerate-placeholder-stars

All flags: python devtools/assets/compress_display_png.py --help
"""

from __future__ import annotations

import argparse
import random
import re
import struct
import sys
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
DEFAULT_BG_DIR = PUBLIC / "background"

# Match src/core/consts.ts
DISPLAY_WIDTH = 320
DISPLAY_HEIGHT = 240

FIT_SUFFIX_RE = re.compile(r"\.\d+x\d+$", re.IGNORECASE)


def require_pillow():
    try:
        from PIL import Image

        return Image
    except ImportError as err:
        raise SystemExit(
            "Pillow is required. Install with: pip install -r devtools/assets/requirements.txt",
        ) from err


def output_path_for(
    src: Path,
    width: int,
    height: int,
    *,
    in_place: bool,
    output_dir: Path | None,
) -> Path:
    if in_place:
        return src
    name = f"{src.stem}.{width}x{height}{src.suffix}"
    parent = output_dir if output_dir is not None else src.parent
    return parent / name


def is_derived_fit_copy(path: Path, width: int, height: int) -> bool:
    """Skip outputs from a previous run when batch-processing a folder."""
    return path.stem.endswith(f".{width}x{height}") or bool(
        FIT_SUFFIX_RE.search(path.stem),
    )


def fit_png(
    path: Path,
    width: int,
    height: int,
    *,
    dry_run: bool,
    allow_upscale: bool,
    in_place: bool,
    output_dir: Path | None,
) -> str | None:
    """Resize to width x height. Returns a status line or None if skipped."""
    Image = require_pillow()
    path = path.resolve()
    if not path.is_file():
        return f"skip (not found): {path}"

    if not in_place and is_derived_fit_copy(path, width, height):
        return f"skip (looks like prior output): {path.relative_to(ROOT)}"

    dest = output_path_for(
        path,
        width,
        height,
        in_place=in_place,
        output_dir=output_dir,
    )

    with Image.open(path) as img:
        src_w, src_h = img.size
        if src_w == width and src_h == height and in_place:
            return f"ok (already {width}x{height}): {path.relative_to(ROOT)}"

        if not allow_upscale and (src_w < width or src_h < height):
            return (
                f"skip (smaller than {width}x{height}, use --allow-upscale): "
                f"{path.relative_to(ROOT)} ({src_w}x{src_h})"
            )

        src_rel = path.relative_to(ROOT)
        dest_rel = dest.relative_to(ROOT)

        if dry_run:
            return f"would write {src_w}x{src_h} -> {width}x{height}: {src_rel} -> {dest_rel}"

        resized = img.resize((width, height), Image.Resampling.NEAREST)
        if resized.mode not in ("RGBA", "RGB"):
            resized = resized.convert("RGBA")
        dest.parent.mkdir(parents=True, exist_ok=True)
        resized.save(dest, optimize=True)
        return f"wrote {width}x{height}: {src_rel} -> {dest_rel}"


def write_png(path: Path, width: int, height: int, rgba: bytes) -> None:
    def chunk(tag: bytes, data: bytes) -> bytes:
        return (
            struct.pack(">I", len(data))
            + tag
            + data
            + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
        )

    raw = bytearray()
    stride = width * 4
    for y in range(height):
        raw.append(0)
        raw.extend(rgba[y * stride : (y + 1) * stride])

    ihdr = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)
    png = (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", ihdr)
        + chunk(b"IDAT", zlib.compress(bytes(raw), 9))
        + chunk(b"IEND", b"")
    )
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(png)


def star_layer(
    seed: int,
    count: int,
    bg: tuple[int, int, int],
    stars: list[tuple[int, int, int]],
    width: int,
    height: int,
) -> bytes:
    rng = random.Random(seed)
    rgba = bytearray([bg[0], bg[1], bg[2], 255] * (width * height))
    for _ in range(count):
        x = rng.randrange(width)
        y = rng.randrange(height)
        tone = stars[rng.randrange(len(stars))]
        i = (y * width + x) * 4
        rgba[i : i + 3] = bytes(tone)
    return bytes(rgba)


def regenerate_placeholder_stars(width: int, height: int) -> None:
    """Writes game-ready filenames (intentionally overwrites runtime assets)."""
    bg_dir = DEFAULT_BG_DIR
    write_png(
        bg_dir / "Stars-Big_1_1_PC.png",
        width,
        height,
        star_layer(
            0x51A1,
            120,
            (8, 12, 28),
            [(180, 190, 220), (220, 230, 255), (140, 160, 200)],
            width,
            height,
        ),
    )
    write_png(
        bg_dir / "Stars-Big_1_2_PC.png",
        width,
        height,
        star_layer(
            0x9F02,
            220,
            (4, 6, 18),
            [(255, 255, 255), (200, 210, 255), (255, 240, 200)],
            width,
            height,
        ),
    )
    print(f"Wrote placeholder stars at {width}x{height} in {bg_dir.relative_to(ROOT)}/")


def collect_background_pngs(directory: Path, width: int, height: int) -> list[Path]:
    if not directory.is_dir():
        return []
    return [
        p
        for p in sorted(directory.glob("*.png"))
        if not is_derived_fit_copy(p, width, height)
    ]


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Fit PNGs to the Beast2D display resolution (nearest-neighbor downscale).",
    )
    parser.add_argument(
        "paths",
        nargs="*",
        type=Path,
        help="PNG files to fit (default target: display size)",
    )
    parser.add_argument(
        "--backgrounds",
        action="store_true",
        help=f"Fit every source PNG in {DEFAULT_BG_DIR.relative_to(ROOT)}/ (skips *.WxH copies)",
    )
    parser.add_argument(
        "--width",
        type=int,
        default=DISPLAY_WIDTH,
        help=f"Target width (default {DISPLAY_WIDTH})",
    )
    parser.add_argument(
        "--height",
        type=int,
        default=DISPLAY_HEIGHT,
        help=f"Target height (default {DISPLAY_HEIGHT})",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=None,
        help="Write all outputs here (default: next to each source file)",
    )
    parser.add_argument(
        "--in-place",
        action="store_true",
        help="Overwrite each source PNG instead of writing a copy",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print actions without writing files",
    )
    parser.add_argument(
        "--allow-upscale",
        action="store_true",
        help="Also enlarge images smaller than the target",
    )
    parser.add_argument(
        "--regenerate-placeholder-stars",
        action="store_true",
        help="Overwrite star background PNGs with built-in placeholders",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv or sys.argv[1:])

    if args.in_place and args.output_dir is not None:
        print("Use either --in-place or --output-dir, not both.", file=sys.stderr)
        return 1

    output_dir = args.output_dir.resolve() if args.output_dir else None

    if args.regenerate_placeholder_stars:
        regenerate_placeholder_stars(args.width, args.height)

    paths: list[Path] = list(args.paths)
    if args.backgrounds:
        paths.extend(
            collect_background_pngs(DEFAULT_BG_DIR, args.width, args.height),
        )

    if not paths and not args.regenerate_placeholder_stars:
        print(
            "No inputs. Pass PNG paths, --backgrounds, or --regenerate-placeholder-stars.",
            file=sys.stderr,
        )
        return 1

    seen: set[Path] = set()
    for raw in paths:
        path = raw.resolve()
        if path in seen:
            continue
        seen.add(path)
        line = fit_png(
            path,
            args.width,
            args.height,
            dry_run=args.dry_run,
            allow_upscale=args.allow_upscale,
            in_place=args.in_place,
            output_dir=output_dir,
        )
        if line:
            print(line)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
