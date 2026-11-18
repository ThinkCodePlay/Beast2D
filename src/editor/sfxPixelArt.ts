import { Beast2D16 } from "../core/ui/palette";

export type Pixel = "." | "o" | "s" | "c" | "y" | "l" | "p" | "h";

const MAP: Record<Exclude<Pixel, ".">, number> = {
  o: Beast2D16.PlumOutline,
  s: Beast2D16.Shadow,
  c: Beast2D16.StoneGray,
  y: Beast2D16.Yellow,
  l: Beast2D16.LeafGreen,
  p: Beast2D16.HotPink,
  h: Beast2D16.Cream,
};

export function hex(rgb: number): string {
  return `#${(rgb & 0xffffff).toString(16).padStart(6, "0")}`;
}

export type PixelGrid = readonly string[];

export function blitGrid(
  ctx: CanvasRenderingContext2D,
  grid: PixelGrid,
  ox: number,
  oy: number,
  fallback: number = Beast2D16.DirtBrown,
): void {
  for (let y = 0; y < grid.length; y += 1) {
    const row = grid[y] ?? "";
    for (let x = 0; x < row.length; x += 1) {
      const key = row[x] as Pixel;
      if (key === "." || key === undefined) continue;
      const rgb = MAP[key as Exclude<Pixel, ".">] ?? fallback;
      ctx.fillStyle = hex(rgb);
      ctx.fillRect(ox + x, oy + y, 1, 1);
    }
  }
}

export function plumFrame(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
): void {
  ctx.fillStyle = hex(Beast2D16.PlumOutline);
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = hex(Beast2D16.Cream);
  ctx.fillRect(1, 1, w - 2, h - 2);
}

/** Frame 0 = CCW limit, 15 = CW limit; 12 o'clock ≈ frame 8. */
export function frameToAngleDeg(frame: number): number {
  const f = Math.min(15, Math.max(0, frame));
  return -140 + (f / 15) * 280;
}

export function valueToFrame(value: number): number {
  return Math.min(15, Math.max(0, Math.round(clamp01(value) * 15)));
}

export function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}
