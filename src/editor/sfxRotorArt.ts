import type { ChipId } from "../core/sfx/chips";
import { CHIPS } from "../core/sfx/chips";
import { Beast2D16 } from "../core/ui/palette";
import { frameToAngleDeg, hex } from "./sfxPixelArt";

/** Logical sprite pixels (72×72). */
const W = 72;
const H = 72;
const CX = 36;
const CY = 38;
const KNOB_R = 15;

const CHIP_DEG: Record<ChipId, number> = {
  pico: 315,
  gb: 225,
  snes: 45,
  gen: 135,
};

const MICRO: Record<string, readonly string[]> = {
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

function drawMicro(ctx: CanvasRenderingContext2D, text: string, ox: number, oy: number, rgb: number): void {
  const chars = text.toUpperCase().split("");
  let x = Math.round(ox);
  const y = Math.round(oy);
  for (const ch of chars) {
    const g = MICRO[ch];
    if (!g) continue;
    for (let row = 0; row < g.length; row += 1) {
      const line = g[row] ?? "";
      for (let col = 0; col < line.length; col += 1) {
        if (line[col] === "1") {
          ctx.fillStyle = hex(rgb);
          ctx.fillRect(x + col, y + row, 1, 1);
        }
      }
    }
    x += 4;
  }
}

function microWidth(text: string): number {
  return text.length * 4 - 1;
}

function drawKnobBody(ctx: CanvasRenderingContext2D): void {
  for (let y = 0; y < H; y += 1) {
    for (let x = 0; x < W; x += 1) {
      const dx = x - CX;
      const dy = y - CY;
      const d2 = dx * dx + dy * dy;
      if (d2 > (KNOB_R + 1) * (KNOB_R + 1)) continue;
      if (d2 > KNOB_R * KNOB_R) {
        ctx.fillStyle = hex(Beast2D16.Shadow);
        ctx.fillRect(x, y, 1, 1);
        continue;
      }
      if (x <= CX && y <= CY && d2 > (KNOB_R - 3) * (KNOB_R - 3)) {
        ctx.fillStyle = hex(Beast2D16.Cream);
      } else {
        ctx.fillStyle = hex(Beast2D16.StoneGray);
      }
      ctx.fillRect(x, y, 1, 1);
    }
  }
}

function drawPointer(ctx: CanvasRenderingContext2D, chip: ChipId): void {
  let a = CHIP_DEG[chip];
  while (a > 180) a -= 360;
  const math = -a;
  const frame = Math.min(15, Math.max(0, Math.round(((math + 140) / 280) * 15)));
  const deg = (frameToAngleDeg(frame) * Math.PI) / 180;
  const tipX = CX + Math.sin(deg) * (KNOB_R - 2);
  const tipY = CY - Math.cos(deg) * (KNOB_R - 2);
  const sx = CX;
  const sy = CY;
  const px = Math.round(tipX);
  const py = Math.round(tipY);
  const steps = Math.max(Math.abs(px - sx), Math.abs(py - sy));
  for (let i = 0; i <= steps; i += 1) {
    const t = steps === 0 ? 0 : i / steps;
    const x = Math.round(sx + (px - sx) * t);
    const y = Math.round(sy + (py - sy) * t);
    ctx.fillStyle = hex(Beast2D16.Yellow);
    ctx.fillRect(x, y, 2, 1);
    ctx.fillRect(x, y + 1, 2, 1);
  }
}

function labelColor(id: ChipId): number {
  if (!CHIPS[id].live) return Beast2D16.StoneGray;
  return Beast2D16.Cream;
}

function drawOutsideLabels(ctx: CanvasRenderingContext2D): void {
  const entries: { id: ChipId; text: string; deg: number }[] = [
    { id: "pico", text: "PICO", deg: 315 },
    { id: "gb", text: "GB", deg: 225 },
    { id: "snes", text: "SNES", deg: 45 },
    { id: "gen", text: "GEN", deg: 135 },
  ];
  const labelR = KNOB_R + 10;
  for (const { id, text, deg } of entries) {
    const rad = (deg * Math.PI) / 180;
    const lx = CX + Math.sin(rad) * labelR;
    const ly = CY - Math.cos(rad) * labelR;
    drawMicro(ctx, text, lx - microWidth(text) / 2, ly - 2, labelColor(id));
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
  drawOutsideLabels(ctx);
  drawKnobBody(ctx);
  drawPointer(ctx, chip);
}