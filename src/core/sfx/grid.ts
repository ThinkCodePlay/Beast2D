/** Sequencer grid: 64 semitone steps (0–63) and 16 volume steps (0–15). Knobs 0–255. */

export const PITCH_MAX = 63;
export const VOLUME_MAX = 15;
export const KNOB_MAX = 255;

export function clampPitch(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(PITCH_MAX, Math.max(0, Math.round(value)));
}

export function clampVolume(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(VOLUME_MAX, Math.max(0, Math.round(value)));
}

export function clampKnob(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(KNOB_MAX, Math.max(0, Math.round(value)));
}

/** Legacy saves used unit floats on pitch and volume. */
export function migratePitchValue(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (Number.isInteger(value) && value <= PITCH_MAX) return clampPitch(value);
  if (value >= 0 && value <= 1) return clampPitch(value * PITCH_MAX);
  return clampPitch(value);
}

export function migrateVolumeValue(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (Number.isInteger(value) && value <= VOLUME_MAX) return clampVolume(value);
  if (value >= 0 && value <= 1) return clampVolume(value * VOLUME_MAX);
  return clampVolume(value);
}

export function migrateKnobValue(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (Number.isInteger(value) && value <= KNOB_MAX) return clampKnob(value);
  if (value >= 0 && value <= 1) return clampKnob(value * KNOB_MAX);
  return clampKnob(value);
}

export function pitchTo01(step: number): number {
  return clampPitch(step) / PITCH_MAX;
}

export function volumeTo01(step: number): number {
  return clampVolume(step) / VOLUME_MAX;
}

export function knobTo01(step: number): number {
  return clampKnob(step) / KNOB_MAX;
}