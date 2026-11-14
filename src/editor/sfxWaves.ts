import type { WaveId } from "../core/sfx/chips";

/** Draw a tiny wave glyph for the 2×3 selector (Leaf on Moss when active, Stone when dimmed). */
export function paintSfxWaveIcon(canvas: HTMLCanvasElement, wave: WaveId, dim: boolean): void {
  const w = 32;
  const h = 24;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, w, h);
  const stroke = dim ? "#746678" : "#93be64";
  ctx.strokeStyle = stroke;
  ctx.fillStyle = stroke;
  ctx.lineWidth = 2;
  ctx.lineJoin = "round";
  const mid = h / 2;

  if (wave === "sqr") {
    ctx.beginPath();
    ctx.moveTo(3, mid + 6);
    ctx.lineTo(3, mid - 6);
    ctx.lineTo(15, mid - 6);
    ctx.lineTo(15, mid + 6);
    ctx.lineTo(27, mid + 6);
    ctx.lineTo(27, mid - 6);
    ctx.stroke();
    return;
  }
  if (wave === "pls") {
    ctx.beginPath();
    ctx.moveTo(3, mid + 5);
    ctx.lineTo(3, mid - 2);
    ctx.lineTo(11, mid - 2);
    ctx.lineTo(11, mid - 7);
    ctx.lineTo(21, mid - 7);
    ctx.lineTo(21, mid - 2);
    ctx.lineTo(29, mid - 2);
    ctx.lineTo(29, mid + 5);
    ctx.stroke();
    return;
  }
  if (wave === "wave") {
    ctx.beginPath();
    for (let x = 0; x <= w; x += 1) {
      const y = mid + Math.sin((x / w) * Math.PI * 2.5) * 7;
      if (x === 0) ctx.moveTo(x + 2, y);
      else ctx.lineTo(x + 2, y);
    }
    ctx.stroke();
    return;
  }
  if (wave === "noise") {
    let x = 3;
    let up = true;
    ctx.beginPath();
    ctx.moveTo(x, mid);
    while (x < w - 3) {
      const y = up ? mid - 7 : mid + 7;
      ctx.lineTo(x, y);
      x += 4;
      up = !up;
    }
    ctx.stroke();
    return;
  }
  if (wave === "saw") {
    ctx.beginPath();
    ctx.moveTo(3, mid + 7);
    ctx.lineTo(10, mid - 7);
    ctx.lineTo(17, mid + 7);
    ctx.lineTo(24, mid - 7);
    ctx.stroke();
    return;
  }
  ctx.beginPath();
  ctx.moveTo(3, mid + 7);
  ctx.lineTo(8, mid);
  ctx.lineTo(16, mid - 7);
  ctx.lineTo(24, mid);
  ctx.lineTo(29, mid + 7);
  ctx.stroke();
}