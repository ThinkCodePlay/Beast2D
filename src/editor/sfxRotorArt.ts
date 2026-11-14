import type { ChipId } from "../core/sfx/chips";
import { CHIPS } from "../core/sfx/chips";
import { Beast2D16 } from "../core/ui/palette";
import { hex } from "./sfxPixelArt";

/** Logical sprite pixels (72×72). */
const W = 72;
const H = 72;
const CX = 36;
const CY = 38;
const KNOB_R = 15;

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

/** Fixed label anchors (top-left of micro string). */
const LABEL_ANCHOR: Record<ChipId, { x: number; y: number; text: string }> = {
  pico: { x: 5, y: 3, text: "PICO" },
  snes: { x: 44, y: 3, text: "SNES" },
  gb: { x: 8, y: 57, text: "GB" },
  gen: { x: 46, y: 57, text: "GEN" },
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

function labelCenter(chip: ChipId): { x: number; y: number } {
  const { x, y, text } = LABEL_ANCHOR[chip];
  return { x: x + microWidth(text) / 2, y: y + 2 };
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

function drawPointerTo(ctx: CanvasRenderingContext2D, chip: ChipId): void {
  const { x: tx, y: ty } = labelCenter(chip);
  const sx = CX;
  const sy = CY;
  const px = Math.round(tx);
  const py = Math.round(ty);
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

function drawFixedLabels(ctx: CanvasRenderingContext2D): void {
  for (const id of ["pico", "gb", "snes", "gen"] as const) {
    const anchor = LABEL_ANCHOR[id];
    drawMicro(ctx, anchor.text, anchor.x, anchor.y, labelColor(id));
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
  drawFixedLabels(ctx);
  drawKnobBody(ctx);
  drawPointerTo(ctx, chip);
}