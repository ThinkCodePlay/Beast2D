import type { PresetId } from "../core/sfx/generate";
import { Beast2D16 } from "../core/ui/palette";
import { blitGrid, hex, plumFrame, type PixelGrid } from "./sfxPixelArt";

const W = 16;
const H = 16;

export type SfxButtonFace = "cream" | "pink" | "moss" | "selected" | "dim";

export type SfxPresetIcon = PresetId | "dice";

const SHOOT: PixelGrid = [
  "................",
  ".....lll........",
  "....lllll.......",
  "....lllll.......",
  "....lllll.......",
  ".....lll........",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
];

const COIN: PixelGrid = [
  "................",
  ".....ooo........",
  "....ollllo......",
  "....ollllo......",
  "....ollllo......",
  ".....ooo........",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
];

const BOOM: PixelGrid = [
  "................",
  "......l.........",
  ".....lll........",
  "....lllll.......",
  "...lllllll......",
  ".....lll........",
  "......l.........",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
];

const HIT: PixelGrid = [
  "................",
  "......l.........",
  ".....lll........",
  "......l.........",
  "....lllllll.....",
  ".....lll........",
  "......l.........",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
];

const JUMP: PixelGrid = [
  "................",
  "......l.........",
  ".....lll........",
  "....lllll.......",
  "...lllllll......",
  "................",
  "....ooooo.......",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
];

const POWER: PixelGrid = [
  "................",
  "......l.........",
  ".....l.l........",
  "....l..l........",
  "...lllll........",
  ".....l.l........",
  ".....lll........",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
];

const DICE: PixelGrid = [
  "................",
  ".....ppp........",
  "....p...p.......",
  "....p.p.p.......",
  "....p...p.......",
  ".....ppp........",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
];

const PRESET_GRIDS: Record<SfxPresetIcon, PixelGrid> = {
  shoot: SHOOT,
  coin: COIN,
  boom: BOOM,
  hit: HIT,
  jump: JUMP,
  power: POWER,
  dice: DICE,
};

function fillFace(ctx: CanvasRenderingContext2D, face: SfxButtonFace, selected: boolean, pressed: boolean): void {
  ctx.clearRect(0, 0, W, H);
  if (face === "dim") {
    plumFrame(ctx, W, H);
    ctx.fillStyle = hex(Beast2D16.Shadow);
    ctx.fillRect(1, 1, W - 2, H - 2);
    return;
  }
  plumFrame(ctx, W, H);
  let inner: number = Beast2D16.Cream;
  if (face === "pink") inner = Beast2D16.HotPink;
  else if (face === "selected" || selected) inner = Beast2D16.Yellow;
  else if (pressed) inner = Beast2D16.Orange;
  ctx.fillStyle = hex(inner);
  ctx.fillRect(1, 1, W - 2, H - 2);
  if (!pressed && face !== "pink") {
    ctx.fillStyle = hex(Beast2D16.Cream);
    ctx.fillRect(1, 1, W - 3, 2);
    ctx.fillRect(1, 1, 2, H - 3);
  }
}

function drawPlay(ctx: CanvasRenderingContext2D, dim: boolean): void {
  const c = dim ? Beast2D16.StoneGray : Beast2D16.HotPink;
  ctx.fillStyle = hex(c);
  for (let dy = -4; dy <= 4; dy += 1) {
    const w = 4 - Math.abs(dy) + 3;
    for (let dx = 0; dx < w; dx += 1) ctx.fillRect(6 + dx, 8 + dy, 1, 1);
  }
}

function drawStop(ctx: CanvasRenderingContext2D, dim: boolean): void {
  ctx.fillStyle = hex(dim ? Beast2D16.StoneGray : Beast2D16.PlumOutline);
  for (let y = 5; y <= 10; y += 1) {
    for (let x = 5; x <= 10; x += 1) ctx.fillRect(x, y, 1, 1);
  }
}

function drawLoop(ctx: CanvasRenderingContext2D, dim: boolean): void {
  ctx.fillStyle = hex(dim ? Beast2D16.StoneGray : Beast2D16.LeafGreen);
  for (let x = 4; x <= 11; x += 1) {
    ctx.fillRect(x, 4, 1, 1);
    ctx.fillRect(x, 10, 1, 1);
  }
  for (let y = 5; y <= 9; y += 1) {
    ctx.fillRect(4, y, 1, 1);
    ctx.fillRect(11, y, 1, 1);
  }
  ctx.fillRect(10, 5, 2, 1);
  ctx.fillRect(5, 9, 2, 1);
}

export function paintSfxButton(
  canvas: HTMLCanvasElement,
  options: {
    face: SfxButtonFace;
    icon?: "play" | "stop" | "loop";
    preset?: SfxPresetIcon;
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
  fillFace(ctx, options.face, selected, pressed);

  if (options.icon === "play") {
    drawPlay(ctx, dim);
    return;
  }
  if (options.icon === "stop") {
    drawStop(ctx, dim);
    return;
  }
  if (options.icon === "loop") {
    drawLoop(ctx, dim);
    return;
  }
  if (options.preset) {
    if (options.preset === "dice" && options.face === "pink") {
      drawDiceFace(ctx, dim);
      return;
    }
    const ink = dim ? Beast2D16.StoneGray : Beast2D16.LeafGreen;
    blitGrid(ctx, PRESET_GRIDS[options.preset], 0, 0, ink);
  }
}

/** Preset keys: 16×16 art scaled 2× on a 32×32 canvas (icon only; frame stays 16px logical). */
export function paintSfxPresetIcon(
  canvas: HTMLCanvasElement,
  preset: SfxPresetIcon,
  options: { face: SfxButtonFace; dim?: boolean; pressed?: boolean },
): void {
  canvas.width = W * 2;
  canvas.height = H * 2;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.imageSmoothingEnabled = false;
  ctx.scale(2, 2);
  const dim = options.dim ?? false;
  const selected = options.face === "selected";
  const pressed = options.pressed ?? false;
  fillFace(ctx, options.face, selected, pressed);

  if (preset === "dice" && options.face === "pink") {
    drawDiceFace(ctx, dim);
    return;
  }
  const ink = dim ? Beast2D16.StoneGray : Beast2D16.LeafGreen;
  blitGrid(ctx, PRESET_GRIDS[preset], 0, 0, ink);
}

function drawDiceFace(ctx: CanvasRenderingContext2D, dim: boolean): void {
  const pip = dim ? Beast2D16.StoneGray : Beast2D16.PlumOutline;
  const face = dim ? Beast2D16.StoneGray : Beast2D16.Cream;
  for (let y = 4; y <= 11; y += 1) {
    for (let x = 4; x <= 11; x += 1) {
      const onEdge = x === 4 || x === 11 || y === 4 || y === 11;
      const corner = (x === 4 || x === 11) && (y === 4 || y === 11);
      if (onEdge && !corner) {
        ctx.fillStyle = hex(face);
        ctx.fillRect(x, y, 1, 1);
      } else if (!onEdge) {
        ctx.fillStyle = hex(face);
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }
  for (let y = 0; y < DICE.length; y += 1) {
    const row = DICE[y] ?? "";
    for (let x = 0; x < row.length; x += 1) {
      if (row[x] === "p") {
        ctx.fillStyle = hex(pip);
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }
}