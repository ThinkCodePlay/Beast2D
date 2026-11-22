import { Graphics } from "pixi.js";

/** Chamfered-octagon outline points shared by every cut-corner face. */
export function chamferPoints(
  x: number,
  y: number,
  w: number,
  h: number,
  c: number,
): number[] {
  return [
    x + c,
    y,
    x + w - c,
    y,
    x + w,
    y + c,
    x + w,
    y + h - c,
    x + w - c,
    y + h,
    x + c,
    y + h,
    x,
    y + h - c,
    x,
    y + c,
  ];
}

export interface FaceTones {
  edge: number;
  top: number;
  mid: number;
  bottom: number;
}

function mix(a: number, b: number, t: number): number {
  const ar = (a >> 16) & 255,
    ag = (a >> 8) & 255,
    ab = a & 255;
  const br = (b >> 16) & 255,
    bg = (b >> 8) & 255,
    bb = b & 255;
  const r = Math.round(ar + (br - ar) * t),
    g = Math.round(ag + (bg - ag) * t),
    bl = Math.round(ab + (bb - ab) * t);
  return (r << 16) | (g << 8) | bl;
}

/**
 * Reference-style pixel face: dark edge, a thin bright light hugging the top
 * edge, and a gentle per-pixel-row shade from the mid tone to the bottom tone.
 * Rows taper near the corners so the chamfered edge stays visible.
 */
export function drawGradientFace(
  graphic: Graphics,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  tones: FaceTones,
  midRatio = 0.55,
  chamfer = 0,
): void {
  const cut = chamfer > 0 ? chamfer : radius;
  const ix = x + 2,
    iy = y + 2,
    iw = width - 4,
    ih = height - 4;
  const corner = Math.max(1, cut - 1);
  if (chamfer > 0) {
    graphic.poly(chamferPoints(x, y, width, height, chamfer)).fill(tones.edge);
  } else {
    graphic.roundRect(x, y, width, height, radius).fill(tones.edge);
  }
  // One rect per design row: smooth shade with a stepped taper at the corners.
  const rows = Math.max(2, Math.round(ih));
  for (let r = 0; r < rows; r += 1) {
    const rowY = iy + (r * ih) / rows;
    const rowH = ih / rows + 0.5;
    // Reference profile: the face holds its mid tone for most of its height and
    // shades toward the bottom tone only in the narrow lower bevel.
    const f = rows === 1 ? 0 : r / (rows - 1);
    const t = Math.max(0, (f - midRatio) / (1 - midRatio));
    const distTop = r;
    const distBottom = rows - 1 - r;
    const inset = Math.max(0, corner - Math.min(distTop, distBottom, corner));
    graphic
      .rect(ix + inset, rowY, iw - inset * 2, rowH)
      .fill(mix(tones.mid, tones.bottom, t));
  }
  // Thin bright light hugging the top edge, following the corner cut.
  graphic
    .rect(ix + corner, iy, iw - corner * 2, 1)
    .fill(tones.top)
    .rect(ix + corner - 1, iy + 1, iw - corner * 2 + 2, 1)
    .fill(tones.top)
    .rect(ix, iy + corner, 1, Math.max(2, height / 3))
    .fill(tones.top);
}
