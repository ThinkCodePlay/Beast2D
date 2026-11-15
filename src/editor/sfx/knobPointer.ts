import { Beast2D16 } from "../../core/ui/palette";
import { frameToAngleDeg, hex, valueToFrame } from "../sfxPixelArt";
import { KNOB_SPRITE_H, KNOB_SPRITE_W } from "./knobSprites";

/** Plum pointer over the cream knob cap (sprite body is a separate img). */
export function paintSfxKnobPointer(canvas: HTMLCanvasElement, value: number, pixel = 1): void {
  const px = Math.max(1, Math.round(pixel));
  const frame = valueToFrame(value);
  canvas.width = KNOB_SPRITE_W * px;
  canvas.height = KNOB_SPRITE_H * px;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = false;
  ctx.setTransform(px, 0, 0, px, 0, 0);

  const cx = 8;
  const cy = 8;
  const r = 5;
  const deg = (frameToAngleDeg(frame) * Math.PI) / 180;
  const tipX = cx + Math.sin(deg) * r;
  const tipY = cy - Math.cos(deg) * r;
  const pxTip = Math.round(tipX);
  const pyTip = Math.round(tipY);
  const sx = Math.round(cx);
  const sy = Math.round(cy);
  const steps = Math.max(Math.abs(pxTip - sx), Math.abs(pyTip - sy));
  ctx.fillStyle = hex(Beast2D16.PlumOutline);
  for (let i = 0; i <= steps; i += 1) {
    const t = steps === 0 ? 0 : i / steps;
    const x = Math.round(sx + (pxTip - sx) * t);
    const y = Math.round(sy + (pyTip - sy) * t);
    ctx.fillRect(x, y, 1, 1);
    ctx.fillRect(x + 1, y, 1, 1);
    ctx.fillRect(x, y + 1, 1, 1);
  }
}