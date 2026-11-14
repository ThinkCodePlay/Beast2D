import type { WaveId } from "../core/sfx/chips";
import { Beast2D16 } from "../core/ui/palette";
import { hex } from "./sfxPixelArt";

const W = 24;
const H = 16;

export type SfxWavePaintState = {
  dim: boolean;
  selected: boolean;
};

/** Wide wave key: plum frame, moss/yellow/shadow screen, leaf/stone waveform. */
export function paintSfxWaveIcon(
  canvas: HTMLCanvasElement,
  wave: WaveId,
  state: SfxWavePaintState,
): void {

  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.imageSmoothingEnabled = false;

  ctx.fillStyle = hex(Beast2D16.PlumOutline);
  ctx.fillRect(0, 0, W, H);

  const screen = state.dim ? Beast2D16.Shadow : state.selected ? Beast2D16.Yellow : Beast2D16.MossGreen;
  ctx.fillStyle = hex(screen);
  ctx.fillRect(1, 1, W - 2, H - 2);

  if (state.selected) {
    ctx.fillStyle = hex(Beast2D16.Orange);
    for (let y = 0; y < H; y += 1) ctx.fillRect(W - 1, y, 1, 1);
    for (let x = 0; x < W; x += 1) ctx.fillRect(x, H - 1, 1, 1);
  }

  const ink = state.dim ? Beast2D16.StoneGray : Beast2D16.LeafGreen;
  ctx.fillStyle = hex(ink);

  const thick = (x: number, y: number) => {
    ctx.fillRect(x, y, 1, 1);
    ctx.fillRect(x, y + 1, 1, 1);
  };

  const mid = 8;

  if (wave === "sqr") {
    for (let x = 2; x <= 20; x += 1) {
      const top = x < 11 ? mid - 5 : mid + 4;
      for (let y = top; y <= mid + 5; y += 1) ctx.fillRect(x, y, 1, 1);
    }
    return;
  }
  if (wave === "pls") {
    for (let y = mid - 5; y <= mid + 5; y += 1) ctx.fillRect(3, y, 1, 1);
    for (let y = mid - 7; y <= mid + 5; y += 1) ctx.fillRect(10, y, 1, 1);
    for (let y = mid - 3; y <= mid + 5; y += 1) ctx.fillRect(17, y, 1, 1);
    return;
  }
  if (wave === "wave") {
    for (let x = 2; x <= 20; x += 1) {
      const y = Math.round(mid + Math.sin((x / 20) * Math.PI * 2) * 4);
      thick(x, y);
    }
    return;
  }
  if (wave === "noise") {
    const heights = [mid - 4, mid + 3, mid - 2, mid + 5, mid - 3, mid + 2, mid - 5, mid + 4, mid - 1, mid + 1];
    let x = 3;
    for (const h of heights) {
      if (x > 20) break;
      ctx.fillRect(x, h, 1, 1);
      ctx.fillRect(x, h + 1, 1, 1);
      x += 2;
    }
    return;
  }
  if (wave === "saw") {
    for (let x = 2; x <= 20; x += 1) {
      const t = ((x - 2) % 6) / 6;
      const y = Math.round(mid + 5 - t * 10);
      thick(x, y);
    }
    return;
  }
  for (let x = 2; x <= 20; x += 1) {
    const t = ((x - 2) % 12) / 12;
    const y = Math.round(mid + Math.sin(t * Math.PI) * 5);
    thick(x, y);
  }
}