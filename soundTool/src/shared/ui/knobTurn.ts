/** Shared dial math: a 270-degree sweep over a dead zone, values 0..1. */
export const KNOB_SWEEP = Math.PI * 1.5;

const FULL_TURN = Math.PI * 2;

/** Clamp a dial value into 0..1. */
export function clampValue(value: number): number {
  return Math.max(0, Math.min(1, value));
}

/**
 * Needle angle in screen radians (y grows down) for a 0..1 value. The sweep
 * starts at `startAngle` and runs clockwise (increasing angle) for 270°.
 */
export function angleForValue(value: number, startAngle: number): number {
  return startAngle + clampValue(value) * KNOB_SWEEP;
}

/**
 * The dial value that points the needle from a knob center toward a pointer
 * position, in the knob's local coordinates. Pointer angles inside the dead
 * zone snap to the nearer end of the sweep.
 */
export function valueTowardPoint(
  centerX: number,
  centerY: number,
  pointX: number,
  pointY: number,
  startAngle: number,
): number {
  const raw = Math.atan2(pointY - centerY, pointX - centerX);
  // Unwrap into [startAngle, startAngle + 360°) so the sweep is contiguous.
  const angle =
    ((((raw - startAngle) % FULL_TURN) + FULL_TURN) % FULL_TURN) + startAngle;
  const maxAngle = startAngle + KNOB_SWEEP;
  if (angle > maxAngle) {
    // Dead zone: snap to whichever end is closer around the circle.
    return angle - maxAngle <= startAngle + FULL_TURN - angle ? 1 : 0;
  }
  return clampValue((angle - startAngle) / KNOB_SWEEP);
}
