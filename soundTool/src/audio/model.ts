import type { PlaybackRate } from './rate.js';

/**
 * Sound data model. Kept free of Pixi so the same values drive the display
 * today and the audio engine and export later. Interface shapes and names are
 * exactly as specified by the project owner.
 */

/** Step volume: the eight tracker levels. Still a plain number at runtime. */
export type StepVolume = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

/**
 * A note as a standard MIDI note number: a whole semitone, 60 is middle C.
 * Validate against NOTE_RANGE when loading or editing; the type alone does
 * not check values at runtime. A rest is `enabled: false`, not a note value.
 */
export type NoteNumber = number;

export interface SoundStep {
  note: NoteNumber;
  volume: StepVolume; // 0 - 7
  enabled: boolean;
}

/** The six oscillator choices, in the order of the waveform buttons. */
export const WAVEFORM_TYPES = ['sine', 'square', 'saw', 'triangle', 'noise', 'pulse'] as const;
export type WaveformType = typeof WAVEFORM_TYPES[number];

export interface SoundSequence {
  /** Playback speed; read at Play, independent of note pitch. */
  rate: PlaybackRate;
  steps: SoundStep[];
  /** One oscillator shape for all steps. */
  waveform: WaveformType;
  /** Normalized output gain: 0 is muted, 1 is full gain. */
  masterVolume: number;
  /** Stereo placement dial: 0 is full left, 0.5 center, 1 full right. */
  pan: number;
  /** Note fade dial: 1 rings the whole step, lower values fade out sooner. */
  decay: number;
  /** Whole-sound shift in semitones: 0 sounds the drawn notes unchanged. */
  pitch: number;
  /** Low-pass filter dial: 1 is fully open (bypassed), lower values darken the sound. */
  cut: number;
}

export const SEQUENCE_STEP_COUNT = 32;
/** Accepted note values: the full MIDI semitone range. */
export const NOTE_RANGE = { min: 0, max: 127 } as const;
/** Displayed window: two octaves, the top bar position is the highest note. */
export const NOTE_WINDOW = 24;
/** Lowest note shown in the window: C4, middle C. */
export const NOTE_WINDOW_BASE = 60;

/** Clamp and round an incoming value to a valid step volume. */
export function toStepVolume(value: number): StepVolume {
  return Math.max(0, Math.min(7, Math.round(value))) as StepVolume;
}

/** A fresh sequence: every step enabled at full volume, master at a quiet audition level. */
export function createSoundSequence(notes?: NoteNumber[]): SoundSequence {
  const steps: SoundStep[] = Array.from({ length: SEQUENCE_STEP_COUNT }, (_, index) => ({
    note: notes?.[index] ?? NOTE_WINDOW_BASE,
    volume: 7,
    enabled: true,
  }));
  // Every dial rests at its neutral position, so a fresh board sounds raw.
  return { steps, waveform: 'sine', masterVolume: 0.25, rate: 1, pan: 0.5, decay: 1, pitch: 0, cut: 1 };
}
