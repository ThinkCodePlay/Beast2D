import type { WaveId } from "../core/sfx/chips";
import { Beast2D16 } from "../core/ui/palette";
import { hex, plumFrame } from "./sfxPixelArt";

const S = 16;

/** 16×16 wave key: plum outline, plum waveform on cream (stone when dimmed). */
export function paintSfxWaveIcon(canvas: HTMLCanvasElement, wave: WaveId, dim: boolean): void {
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.imageSmoothingEnabled = false;
  plumFrame(ctx, S, S);
  ctx.fillStyle = hex(Beast2D16.Cream);
  ctx.fillRect(1, 1, S - 2, S - 2);

  const ink = dim ? Beast2D16.StoneGray : Beast2D16.PlumOutline;
  ctx.fillStyle = hex(ink);

  const mid = 8;

  if (wave === "sqr") {
    for (let x = 2; x <= 13; x += 1) {
      const top = x < 8 ? mid - 5 : mid + 5;
      for (let y = top; y <= mid + 5; y += 1) ctx.fillRect(x, y, 1, 1);
    }
    return;
  }
  if (wave === "pls") {
    for (let y = mid - 5; y <= mid + 5; y += 1) ctx.fillRect(2, y, 1, 1);
    for (let y = mid - 7; y <= mid + 5; y += 1) ctx.fillRect(7, y, 1, 1);
    for (let y = mid - 3; y <= mid + 5; y += 1) ctx.fillRect(12, y, 1, 1);
    return;
  }
  if (wave === "wave") {
    for (let x = 2; x <= 13; x += 1) {
      const y = Math.round(mid + Math.sin((x / 12) * Math.PI * 2) * 4);
      ctx.fillRect(x, y, 1, 1);
      ctx.fillRect(x, y + 1, 1, 1);
    }
    return;
  }
  if (wave === "noise") {
    const heights = [mid - 4, mid + 3, mid - 2, mid + 5, mid - 3, mid + 2, mid - 5, mid + 4];
    let x = 2;
    for (const h of heights) {
      ctx.fillRect(x, h, 1, 1);
      x += 1;
    }
    return;
  }
  if (wave === "saw") {
    for (let x = 2; x <= 13; x += 1) {
      const t = ((x - 2) % 6) / 6;
      const y = Math.round(mid + 5 - t * 10);
      ctx.fillRect(x, y, 1, 1);
    }
    return;
  }
  for (let x = 2; x <= 13; x += 1) {
    const t = ((x - 2) % 12) / 12;
    const y = Math.round(mid + Math.sin(t * Math.PI) * 6);
    ctx.fillRect(x, y, 1, 1);
  }
}