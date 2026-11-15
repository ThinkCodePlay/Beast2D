import type { ChipId } from "../core/sfx/chips";
import { Beast2D16 } from "../core/ui/palette";
import { hex } from "./sfxPixelArt";
import { PRESET_SPRITE_H, PRESET_SPRITE_W } from "./sfx/presetSprites";
import { KNOB_SPRITE_H, KNOB_SPRITE_W, knobSpriteUrl } from "./sfx/knobSprites";

const W = PRESET_SPRITE_W;
const H = PRESET_SPRITE_H;
const CX = W / 2;
const CY = H / 2;
const STONE_MARGIN = 1;

const LABEL_CENTER: Record<ChipId, { x: number; y: number }> = {
  pico: { x: 4, y: 4 },
  snes: { x: W - 4, y: 4 },
  gb: { x: 4, y: H - 4 },
  gen: { x: W - 4, y: H - 4 },
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

function stoneScale(): number {
  return Math.min(
    Math.floor((W - STONE_MARGIN * 2) / KNOB_SPRITE_W),
    Math.floor((H - STONE_MARGIN * 2) / KNOB_SPRITE_H),
  );
}

function drawStoneKnob(ctx: CanvasRenderingContext2D): void {
  const img = loadStoneKnob();
  if (!img.complete || img.naturalWidth === 0) return;
  const scale = stoneScale();
  const w = KNOB_SPRITE_W * scale;
  const h = KNOB_SPRITE_H * scale;
  const x = Math.round(CX - w / 2);
  const y = Math.round(CY - h / 2);
  ctx.drawImage(img, 0, 0, KNOB_SPRITE_W, KNOB_SPRITE_H, x, y, w, h);
}

/** Plum pointer from the cream cap toward the active chip label. */
function drawPointerTo(ctx: CanvasRenderingContext2D, chip: ChipId): void {
  const capX = Math.round(CX);
  const capY = Math.round(CY - 1);
  const { x: tx, y: ty } = LABEL_CENTER[chip];
  const dx = tx - capX;
  const dy = ty - capY;
  const len = Math.hypot(dx, dy) || 1;
  const reach = stoneScale() * 3;
  const tipX = Math.round(capX + (dx / len) * reach);
  const tipY = Math.round(capY + (dy / len) * reach);
  const sx = capX;
  const sy = capY;
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

/** 32×28 key cell; `pixel` = device pixels per art pixel (integer × chrome). */
export function paintSfxRotor(canvas: HTMLCanvasElement, chip: ChipId, pixel = 1): void {
  const px = Math.max(1, Math.round(pixel));
  canvas.width = W * px;
  canvas.height = H * px;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.imageSmoothingEnabled = false;
  ctx.setTransform(px, 0, 0, px, 0, 0);
  ctx.clearRect(0, 0, W, H);
  drawStoneKnob(ctx);
  drawPointerTo(ctx, chip);
}