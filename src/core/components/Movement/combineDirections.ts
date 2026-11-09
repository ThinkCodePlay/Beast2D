export interface MovementDirection {
  x: number;
  y: number;
}

/** Sums direction vectors and clamps magnitude to at most 1. */
export function combineDirections(
  vectors: readonly MovementDirection[],
): MovementDirection {
  let x = 0;
  let y = 0;
  for (const v of vectors) {
    x += v.x;
    y += v.y;
  }
  const mag = Math.hypot(x, y);
  if (mag <= 1 || mag === 0) return { x, y };
  return { x: x / mag, y: y / mag };
}
