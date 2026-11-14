import { Beast2D16 } from "../core/ui/palette";
import { frameToAngleDeg, hex, valueToFrame } from "./sfxPixelArt";

export const KNOB_SIZE = 24;

export function paintSfxKnob(canvas: HTMLCanvasElement, value: number): void {
  const frame = valueToFrame(value);
  canvas.width = KNOB_SIZE;
  canvas.height = KNOB_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, KNOB_SIZE, KNOB_SIZE);

  const cx = 12;
  const cy = 12;
  const r = 9;

  for (let y = 0; y < KNOB_SIZE; y += 1) {
    for (let x = 0; x < KNOB_SIZE; x += 1) {
      const dx = x - cx;
      const dy = y - cy;
      const d2 = dx * dx + dy * dy;
      if (d2 > (r + 1) * (r + 1)) continue;
      if (d2 > r * r) {
        ctx.fillStyle = hex(Beast2D16.Shadow);
        ctx.fillRect(x, y, 1, 1);
        continue;
      }
      if (x <= cx && y <= cy && d2 > (r - 3) * (r - 3)) {
        ctx.fillStyle = hex(Beast2D16.Cream);
      } else {
        ctx.fillStyle = hex(Beast2D16.StoneGray);
      }
      ctx.fillRect(x, y, 1, 1);
    }
  }

  const deg = (frameToAngleDeg(frame) * Math.PI) / 180;
  const tipX = cx + Math.sin(deg) * (r - 2);
  const tipY = cy - Math.cos(deg) * (r - 2);
  const px = Math.round(tipX);
  const py = Math.round(tipY);
  const sx = Math.round(cx);
  const sy = Math.round(cy);
  const steps = Math.max(Math.abs(px - sx), Math.abs(py - sy));
  for (let i = 0; i <= steps; i += 1) {
    const t = steps === 0 ? 0 : i / steps;
    const x = Math.round(sx + (px - sx) * t);
    const y = Math.round(sy + (py - sy) * t);
    ctx.fillStyle = hex(Beast2D16.Yellow);
    ctx.fillRect(x, y, 1, 1);
    ctx.fillRect(x + 1, y, 1, 1);
    ctx.fillRect(x, y + 1, 1, 1);
    ctx.fillRect(x + 1, y + 1, 1, 1);
  }
}