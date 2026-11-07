export interface Point2 {
  x: number;
  y: number;
}

export interface MoveTowardsAxes {
  x?: boolean;
  y?: boolean;
}

/**
 * Moves `from` toward `to` by at most `maxStep` (same units as positions).
 * Never overshoots; returns `to` when within one step.
 */
export function stepMoveTowards(
  from: Point2,
  to: Point2,
  maxStep: number,
  axes: MoveTowardsAxes = { x: true, y: true },
): Point2 {
  if (maxStep <= 0) return { x: from.x, y: from.y };

  const dx = axes.x !== false ? to.x - from.x : 0;
  const dy = axes.y !== false ? to.y - from.y : 0;
  const dist = Math.hypot(dx, dy);
  if (dist === 0) return { x: from.x, y: from.y };
  if (dist <= maxStep) {
    return { x: from.x + dx, y: from.y + dy };
  }

  const scale = maxStep / dist;
  return {
    x: from.x + dx * scale,
    y: from.y + dy * scale,
  };
}
