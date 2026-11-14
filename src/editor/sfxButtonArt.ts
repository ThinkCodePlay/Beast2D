import { Beast2D16 } from "../core/ui/palette";
import { hex, plumFrame } from "./sfxPixelArt";

const W = 16;
const H = 16;

export type SfxButtonFace = "cream" | "pink" | "moss" | "selected" | "dim";

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
  }
}