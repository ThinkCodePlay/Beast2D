import type { ChipId } from "../core/sfx/chips";
import { CHIPS } from "../core/sfx/chips";
import { Beast2D16 } from "../core/ui/palette";
import { frameToAngleDeg, hex } from "./sfxPixelArt";

const W = 48;
const H = 48;

const ROTOR_CSS: Record<ChipId, number> = {
  pico: 315,
  gb: 225,
  snes: 45,
  gen: 135,
};

function cssAngleToFrame(deg: number): number {
  let a = deg;
  while (a > 180) a -= 360;
  const math = -a;
  return Math.min(15, Math.max(0, Math.round(((math + 140) / 280) * 15)));
}

const MICRO: Record<string, Pixel3x5> = {
  P: ["111", "101", "111", "100", "100"],
  I: ["111", "010", "010", "010", "111"],
  C: ["111", "100", "100", "100", "111"],
  O: ["111", "101", "101", "101", "111"],
  G: ["111", "100", "110", "101", "111"],
  B: ["111", "101", "111", "101", "111"],
  S: ["111", "100", "111", "001", "111"],
  N: ["101", "111", "111", "111", "101"],
  E: ["111", "100", "110", "100", "111"],
};

type Pixel3x5 = readonly string[];

function drawMicro(
  ctx: CanvasRenderingContext2D,
  text: string,
  ox: number,
  oy: number,
  rgb: number,
): void {
  const chars = text.toUpperCase().split("");
  let x = ox;
  for (const ch of chars) {
    const g = MICRO[ch];
    if (!g) continue;
    for (let row = 0; row < g.length; row += 1) {
      const line = g[row] ?? "";
      for (let col = 0; col < line.length; col += 1) {
        if (line[col] === "1") {
          ctx.fillStyle = hex(rgb);
          ctx.fillRect(x + col, oy + row, 1, 1);
        }
      }
    }
    x += 4;
  }
}

export function paintSfxRotor(canvas: HTMLCanvasElement, chip: ChipId, scale = 1): void {
  const pixel = Math.max(1, Math.round(scale));
  canvas.width = W * pixel;
  canvas.height = H * pixel;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.imageSmoothingEnabled = false;
  ctx.setTransform(pixel, 0, 0, pixel, 0, 0);
  ctx.clearRect(0, 0, W, H);

  const cx = 24;
  const cy = 24;
  const r = 18;

  for (let y = 0; y < H; y += 1) {
    for (let x = 0; x < W; x += 1) {
      const dx = x - cx;
      const dy = y - cy;
      const d2 = dx * dx + dy * dy;
      if (d2 > (r + 1) * (r + 1)) continue;
      if (d2 > r * r) {
        ctx.fillStyle = hex(Beast2D16.Shadow);
        ctx.fillRect(x, y, 1, 1);
        continue;
      }
      if (x <= cx && y <= cy) ctx.fillStyle = hex(Beast2D16.Cream);
      else ctx.fillStyle = hex(Beast2D16.StoneGray);
      ctx.fillRect(x, y, 1, 1);
    }
  }

  const liveColor = (id: ChipId) => (CHIPS[id].live ? Beast2D16.LeafGreen : Beast2D16.StoneGray);
  drawMicro(ctx, "PICO", 4, 3, liveColor("pico"));
  drawMicro(ctx, "SNES", 28, 3, liveColor("snes"));
  drawMicro(ctx, "GB", 4, 38, liveColor("gb"));
  drawMicro(ctx, "GEN", 30, 38, liveColor("gen"));

  for (const angle of [315, 225, 45, 135]) {
    const rad = (angle * Math.PI) / 180;
    const tx = cx + Math.sin(rad) * (r - 4);
    const ty = cy - Math.cos(rad) * (r - 4);
    ctx.fillStyle = hex(Beast2D16.PlumOutline);
    ctx.fillRect(Math.round(tx), Math.round(ty), 2, 2);
  }

  const frame = cssAngleToFrame(ROTOR_CSS[chip]);
  const deg = (frameToAngleDeg(frame) * Math.PI) / 180;
  const tipX = cx + Math.sin(deg) * (r - 3);
  const tipY = cy - Math.cos(deg) * (r - 3);
  const sx = cx;
  const sy = cy;
  const px = Math.round(tipX);
  const py = Math.round(tipY);
  const steps = Math.max(Math.abs(px - sx), Math.abs(py - sy));
  for (let i = 0; i <= steps; i += 1) {
    const t = steps === 0 ? 0 : i / steps;
    const x = Math.round(sx + (px - sx) * t);
    const y = Math.round(sy + (py - sy) * t);
    ctx.fillStyle = hex(Beast2D16.Yellow);
    ctx.fillRect(x, y, 2, 2);
  }
}