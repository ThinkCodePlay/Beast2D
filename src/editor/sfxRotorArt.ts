import type { ChipId } from "../core/sfx/chips";
import { Beast2D16 } from "../core/ui/palette";
import { hex } from "./sfxPixelArt";
import { KNOB_SPRITE_H, KNOB_SPRITE_W, knobSpriteUrl } from "./sfx/knobSprites";

/** Logical pixels (64×56), matches preset key size. */
const W = 64;
const H = 56;
const CX = 32;
const CY = 30;
const KNOB_SCALE = 3;

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

const LABEL_ANCHOR: Record<ChipId, { x: number; y: number; text: string }> = {
  pico: { x: 3, y: 2, text: "PICO" },
  snes: { x: 40, y: 2, text: "SNES" },
  gb: { x: 6, y: 44, text: "GB" },
  gen: { x: 42, y: 44, text: "GEN" },
};

let stoneKnob: HTMLImageElement | null = null;

function loadStoneKnob(): HTMLImageElement {
  if (!stoneKnob) {
    stoneKnob = new Image();
    stoneKnob.src = knobSpriteUrl("stone");
    stoneKnob.decoding = "sync";
  }
  return stoneKnob;
}

void loadStoneKnob().decode?.();

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

function labelColor(id: ChipId): number {
  if (id === "snes" || id === "gen") return Beast2D16.Shadow;
  return Beast2D16.Cream;
}

function drawFixedLabels(ctx: CanvasRenderingContext2D): void {
  for (const id of ["pico", "gb", "snes", "gen"] as const) {
    const anchor = LABEL_ANCHOR[id];
    drawMicro(ctx, anchor.text, anchor.x, anchor.y, labelColor(id));
  }
}

function drawStoneKnob(ctx: CanvasRenderingContext2D): void {
  const img = loadStoneKnob();
  if (!img.complete || img.naturalWidth === 0) return;
  const w = KNOB_SPRITE_W * KNOB_SCALE;
  const h = KNOB_SPRITE_H * KNOB_SCALE;
  const x = Math.round(CX - w / 2);
  const y = Math.round(CY - h / 2 + 1);
  ctx.drawImage(img, 0, 0, KNOB_SPRITE_W, KNOB_SPRITE_H, x, y, w, h);
}

/** Plum pointer from the cream cap toward the active chip label. */
function drawPointerTo(ctx: CanvasRenderingContext2D, chip: ChipId): void {
  const capX = CX;
  const capY = CY - 2;
  const { x: tx, y: ty } = labelCenter(chip);
  const dx = tx - capX;
  const dy = ty - capY;
  const len = Math.hypot(dx, dy) || 1;
  const reach = KNOB_SCALE * 4;
  const tipX = Math.round(capX + (dx / len) * reach);
  const tipY = Math.round(capY + (dy / len) * reach);
  const sx = Math.round(capX);
  const sy = Math.round(capY);
  const steps = Math.max(Math.abs(tipX - sx), Math.abs(tipY - sy));
  ctx.fillStyle = hex(Beast2D16.PlumOutline);
  for (let i = 0; i <= steps; i += 1) {
    const t = steps === 0 ? 0 : i / steps;
    const x = Math.round(sx + (tipX - sx) * t);
    const y = Math.round(sy + (tipY - sy) * t);
    ctx.fillRect(x, y, 1, 1);
    ctx.fillRect(x + 1, y, 1, 1);
    ctx.fillRect(x, y + 1, 1, 1);
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
  drawStoneKnob(ctx);
  drawFixedLabels(ctx);
  drawPointerTo(ctx, chip);
}