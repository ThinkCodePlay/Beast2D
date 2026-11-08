import type { Direction2 } from "./combineDirections";

export interface PointerArrivalOptions {
  /** Logical units; scales request magnitude as distance decreases. */
  arriveRadius: number;
  /** One movement step at current speed (speed * deltaTime). */
  maxStep: number;
}

/**
 * Unit direction toward `target` with bounded analog magnitude so summed requests
 * stay in the generic Movement contract (no overshoot special-casing in Movement).
 */
export function pointerArrivalDirection(
  fromX: number,
  fromY: number,
  targetX: number,
  targetY: number,
  options: PointerArrivalOptions,
  axes: { x: boolean; y: boolean },
): Direction2 {
  let dx = axes.x ? targetX - fromX : 0;
  let dy = axes.y ? targetY - fromY : 0;
  const dist = Math.hypot(dx, dy);
  if (dist === 0) return { x: 0, y: 0 };
  if (dist <= options.maxStep) return { x: 0, y: 0 };

  const arriveRadius = Math.max(options.arriveRadius, options.maxStep * 2);
  const magnitude = Math.min(1, dist / arriveRadius);
  return { x: (dx / dist) * magnitude, y: (dy / dist) * magnitude };
}
