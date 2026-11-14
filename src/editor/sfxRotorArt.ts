import type { ChipId } from "../core/sfx/chips";
import { Beast2D16 } from "../core/ui/palette";
import { hex } from "./sfxPixelArt";
import { KNOB_SPRITE_H, KNOB_SPRITE_W, knobSpriteUrl } from "./sfx/knobSprites";

/** Logical pixels (64×56), matches `--sfx-key-w` / `--sfx-key-h`. */
const W = 64;
const H = 56;
const CX = 32;
const CY = 30;
const KNOB_SCALE = 3;

const LABEL_CENTER: Record<ChipId, { x: number; y: number }> = {
  pico: { x: 11, y: 8 },
  snes: { x: 53, y: 8 },
  gb: { x: 11, y: 48 },
  gen: { x: 53, y: 48 },
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

function labelCenter(chip: ChipId): { x: number; y: number } {
  return LABEL_CENTER[chip];
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
    const y = Math.round(sy + (ty - sy) * t);
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
  drawPointerTo(ctx, chip);
}