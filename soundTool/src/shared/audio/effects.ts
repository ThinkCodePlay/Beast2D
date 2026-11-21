import { normalizedVolume } from './synthesis.js';

/**
 * Dial mappings for the PAN, DECAY, PITCH and CUT controls. The sequence
 * stores plain dial values (semitones for PITCH); these turn them into
 * audio parameters, keeping the audio nodes free of dial math.
 */

/** PAN snaps to five detents, so the center position is exact. */
export const PAN_DETENT_COUNT = 5;

export function snapPanDial(value: number): number {
  const detents = PAN_DETENT_COUNT - 1;
  return Math.round(normalizedVolume(value) * detents) / detents;
}

/** Stereo position for the panner node: -1 full left, 0 center, 1 full right. */
export function panFromDial(value: number): number {
  return snapPanDial(value) * 2 - 1;
}

/** PITCH shifts the whole sound in semitones, one octave each way. */
export const PITCH_RANGE_SEMITONES = 12;

export function snapPitchDial(value: number): number {
  const steps = PITCH_RANGE_SEMITONES * 2;
  return Math.round(normalizedVolume(value) * steps) / steps;
}

export function pitchFromDial(value: number): number {
  return Math.round(snapPitchDial(value) * PITCH_RANGE_SEMITONES * 2) - PITCH_RANGE_SEMITONES;
}

export function pitchToDial(pitch: number): number {
  return (validPitch(pitch) + PITCH_RANGE_SEMITONES) / (PITCH_RANGE_SEMITONES * 2);
}

export function validPitch(pitch: number): number {
  if (!Number.isFinite(pitch)) return 0;
  return Math.max(-PITCH_RANGE_SEMITONES, Math.min(PITCH_RANGE_SEMITONES, Math.round(pitch)));
}

/** CUT sweeps the low-pass cutoff logarithmically; the player bypasses the filter at 1. */
export const CUTOFF_MIN_HZ = 120;
export const CUTOFF_MAX_HZ = 16000;

export function cutoffFromDial(value: number): number {
  const dial = normalizedVolume(value);
  if (dial <= 0) return CUTOFF_MIN_HZ;
  if (dial >= 1) return CUTOFF_MAX_HZ;
  return CUTOFF_MIN_HZ * (CUTOFF_MAX_HZ / CUTOFF_MIN_HZ) ** dial;
}

/** DECAY sets the share of the step each note rings; 1 sustains the whole step. */
export const DECAY_MIN_SHARE = 0.06;

export function ringShareFromDial(value: number): number {
  return DECAY_MIN_SHARE + (1 - DECAY_MIN_SHARE) * normalizedVolume(value);
}
