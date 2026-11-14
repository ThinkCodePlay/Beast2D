import { DEFAULT_BEAST2D_BITMAP_FONT } from "../core/ui/defaultBitmapFont";
import { Beast2D16 } from "../core/ui/palette";

const W = 16;
const H = 16;

/** Pico-8–style raised tiles: yellow face, cream gleam, orange lip; selected = orange fill. */
export type SfxButtonFace = "cream" | "pink" | "moss" | "selected" | "dim";

const HEX: Record<string, number> = {
  o: Beast2D16.PlumOutline,
  b: Beast2D16.DirtBrown,
};

function hex(rgb: number): string {
  return `#${(rgb & 0xffffff).toString(16).padStart(6, "0")}`;
}

const OUTLINE = hex(Beast2D16.PlumOutline);
const GLEAM = hex(Beast2D16.Cream);
const FACE = hex(Beast2D16.Yellow);
const LIP = hex(Beast2D16.Orange);
const LIP_DARK = hex(Beast2D16.DirtBrown);
const ICON = hex(Beast2D16.DirtBrown);
const ICON_DIM = hex(Beast2D16.StoneGray);

function drawPicoFace(ctx: CanvasRenderingContext2D, selected: boolean, pressed: boolean): void {
  ctx.clearRect(0, 0, W, H);
  const body = selected ? hex(Beast2D16.Orange) : FACE;
  const gleam = selected ? hex(Beast2D16.Yellow) : GLEAM;

  for (let y = 0; y < H; y += 1) {
    for (let x = 0; x < W; x += 1) {
      const edge = x === 0 || y === 0 || x === W - 1 || y === H - 1;
      if (edge) {
        ctx.fillStyle = OUTLINE;
        ctx.fillRect(x, y, 1, 1);
        continue;
      }
      if (pressed) {
        if (y === 1 || x === 1) {
          ctx.fillStyle = LIP_DARK;
        } else if (y >= H - 3) {
          ctx.fillStyle = gleam;
        } else {
          ctx.fillStyle = selected ? hex(Beast2D16.DirtBrown) : LIP;
        }
        ctx.fillRect(x, y, 1, 1);
        continue;
      }
      if (y === 1) {
        ctx.fillStyle = gleam;
      } else if (y === 2 && (x === 1 || x === 2)) {
        ctx.fillStyle = gleam;
      } else if (y === 3 && x === 1) {
        ctx.fillStyle = gleam;
      } else if (y >= H - 3) {
        ctx.fillStyle = y === H - 2 ? LIP : LIP_DARK;
      } else {
        ctx.fillStyle = body;
      }
      ctx.fillRect(x, y, 1, 1);
    }
  }
}

type PixelGrid = readonly string[];

const PLAY: PixelGrid = [
  "........",
  "...b....",
  "..bbb...",
  ".bbbbb..",
  "..bbb...",
  "...b....",
  "........",
  "........",
];

const STOP: PixelGrid = [
  "........",
  "..bbb...",
  "..bbb...",
  "..bbb...",
  "..bbb...",
  "........",
  "........",
  "........",
];

const LOOP: PixelGrid = [
  "..bbb...",
  ".b...b..",
  "b....b..",
  ".....b..",
  "b....b..",
  ".bbbb...",
  "........",
  "........",
];

function blitGrid(ctx: CanvasRenderingContext2D, grid: PixelGrid, ox: number, oy: number, color: string): void {
  for (let y = 0; y < grid.length; y += 1) {
    const row = grid[y] ?? "";
    for (let x = 0; x < row.length; x += 1) {
      const key = row[x];
      if (key === "." || key === undefined) continue;
      ctx.fillStyle = key === "b" ? color : HEX[key] !== undefined ? hex(HEX[key]!) : color;
      ctx.fillRect(ox + x, oy + y, 1, 1);
    }
  }
}

let fontAtlas: HTMLImageElement | null = null;

function fontImage(): HTMLImageElement {
  if (!fontAtlas) {
    fontAtlas = new Image();
    fontAtlas.src = `/${DEFAULT_BEAST2D_BITMAP_FONT.atlasPath}`;
  }
  return fontAtlas;
}

function drawChar(ctx: CanvasRenderingContext2D, ch: string, dim: boolean): void {
  const glyph = DEFAULT_BEAST2D_BITMAP_FONT.glyphs[ch];
  if (!glyph) return;
  const img = fontImage();
  const gw = DEFAULT_BEAST2D_BITMAP_FONT.glyphW;
  const gh = DEFAULT_BEAST2D_BITMAP_FONT.glyphH;
  const scale = 2;
  const dw = gw * scale;
  const dh = gh * scale;
  const ox = Math.floor((W - dw) / 2);
  const oy = Math.floor((H - dh) / 2);
  const draw = () => {
    const scratch = document.createElement("canvas");
    scratch.width = dw;
    scratch.height = dh;
    const sctx = scratch.getContext("2d");
    if (!sctx) return;
    sctx.imageSmoothingEnabled = false;
    sctx.drawImage(img, glyph.x, glyph.y, gw, gh, 0, 0, dw, dh);
    const data = sctx.getImageData(0, 0, dw, dh);
    const fill = dim ? Beast2D16.StoneGray : Beast2D16.DirtBrown;
    const r = (fill >> 16) & 0xff;
    const g = (fill >> 8) & 0xff;
    const b = fill & 0xff;
    for (let i = 0; i < data.data.length; i += 4) {
      if (data.data[i + 3]! === 0) continue;
      data.data[i] = r;
      data.data[i + 1] = g;
      data.data[i + 2] = b;
      data.data[i + 3] = 255;
    }
    sctx.putImageData(data, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(scratch, ox, oy);
  };
  if (img.complete && img.naturalWidth > 0) draw();
  else img.addEventListener("load", draw, { once: true });
}

export function paintSfxButton(
  canvas: HTMLCanvasElement,
  options: {
    face: SfxButtonFace;
    icon?: "play" | "stop" | "loop";
    char?: string;
    dim?: boolean;
    pressed?: boolean;
  },
): void {
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.imageSmoothingEnabled = false;
  const dim = options.dim ?? false;
  const selected = options.face === "selected";
  const pressed = options.pressed ?? false;
  if (options.face === "dim") {
    ctx.fillStyle = OUTLINE;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = hex(Beast2D16.Shadow);
    ctx.fillRect(1, 1, W - 2, H - 2);
  } else {
    drawPicoFace(ctx, selected, pressed);
  }
  const tint = dim ? ICON_DIM : ICON;
  if (options.icon) {
    const grid = options.icon === "play" ? PLAY : options.icon === "stop" ? STOP : LOOP;
    blitGrid(ctx, grid, 4, 4, tint);
    return;
  }
  if (options.char) {
    drawChar(ctx, options.char, dim);
  }
}