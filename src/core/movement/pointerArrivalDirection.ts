import type { Direction2 } from "./combineDirections";

export interface PointerArrivalOptions {
  /** Logical units; ease-in only while farther than this distance. */
  arriveRadius: number;
  /** One movement step at current speed (speed * deltaTime). */
  maxStep: number;
}

/**
 * Direction toward `target` for the generic Movement contract.
 * Magnitude is capped by `dist / maxStep` so one applied step never overshoots
 * the hold point. Farther than `arriveRadius`, magnitude is also eased by
 * `dist / arriveRadius`.
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

  const arriveRadius = Math.max(options.arriveRadius, options.maxStep * 2);
  const noOvershoot =
    options.maxStep > 0 ? Math.min(1, dist / options.maxStep) : 0;
  let magnitude = noOvershoot;
  if (dist > arriveRadius) {
    magnitude = Math.min(magnitude, dist / arriveRadius);
  }

  return {
    x: (dx / dist) * magnitude,
    y: (dy / dist) * magnitude,
  };
}
