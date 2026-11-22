import { createSoundSequence, type SoundSequence, type StepVolume, type WaveformType } from './audio/model.js';
import type { PlaybackRate } from './audio/rate.js';
import type { SoundBank } from './bank.js';

/**
 * The six preset sounds behind the creation panel's pads, one per kept pad
 * icon: coin, power-up (star), jump (boot), explosion (bomb), hit (burst)
 * and enemy death (skull). Kept free of Pixi, like the audio model and the
 * bank, so the same definitions drive both renderers and the tests can load
 * them without a DOM.
 *
 * A preset is a complete sound: name, notes, waveform and dial settings.
 * Applying one replaces the selected bank slot's sound through
 * SoundBank.replaceSelected, which snapshots the slot for Undo first.
 */

/** The preset pads' icons, in display order. Subset of PresetIcon. */
export const PRESET_KEYS = ['coin', 'star', 'boot', 'bomb', 'burst', 'skull'] as const;
export type PresetKey = typeof PRESET_KEYS[number];

/** Type guard so a pad's PresetIcon can be looked up in PRESETS safely. */
export function isPresetKey(icon: string): icon is PresetKey {
  return (PRESET_KEYS as readonly string[]).includes(icon);
}

/** One played note of a preset: step index, MIDI note, optional volume (default 7). */
interface PresetNote {
  at: number;
  note: number;
  volume?: StepVolume;
}

/** Declarative preset shape: everything a SoundSequence needs beyond the notes. */
interface PresetSpec {
  /** Bank slot name after applying, capped by the bank at MAX_NAME_LENGTH. */
  name: string;
  waveform: WaveformType;
  /** Playback speed; presets run quick game sounds at double rate. */
  rate?: PlaybackRate;
  /** Note fade dial; short sounds fade faster. */
  decay?: number;
  /** Low-pass dial; explosions darken the filter. */
  cut?: number;
  notes: PresetNote[];
}

export const PRESETS: Record<PresetKey, PresetSpec> = {
  // Classic two-note coin ding: quick perfect fifth up.
  coin: { name: 'coin', waveform: 'pulse', rate: 2, decay: 0.5, notes: [
    { at: 0, note: 79 },
    { at: 1, note: 83 },
  ] },
  // Rising major arpeggio for collecting a power-up.
  star: { name: 'power_up', waveform: 'triangle', rate: 2, decay: 0.8, notes: [
    { at: 0, note: 60, volume: 6 },
    { at: 1, note: 64, volume: 6 },
    { at: 2, note: 67, volume: 6 },
    { at: 3, note: 72, volume: 7 },
    { at: 4, note: 76, volume: 7 },
    { at: 5, note: 79, volume: 7 },
  ] },
  // Quick rising sweep, like a jump whoosh.
  boot: { name: 'jump', waveform: 'square', rate: 2, decay: 0.7, notes: [
    { at: 0, note: 60, volume: 7 },
    { at: 1, note: 64, volume: 6 },
    { at: 2, note: 67, volume: 6 },
    { at: 3, note: 72, volume: 5 },
    { at: 4, note: 76, volume: 5 },
    { at: 5, note: 81, volume: 4 },
  ] },
  // Explosion: noise burst on low steps, fading out through a dark filter.
  bomb: { name: 'boom', waveform: 'noise', rate: 1, decay: 0.8, cut: 0.5, notes: [
    { at: 0, note: 48, volume: 7 },
    { at: 1, note: 48, volume: 7 },
    { at: 2, note: 48, volume: 6 },
    { at: 3, note: 48, volume: 6 },
    { at: 4, note: 48, volume: 5 },
    { at: 5, note: 48, volume: 4 },
    { at: 6, note: 48, volume: 4 },
    { at: 7, note: 48, volume: 3 },
    { at: 8, note: 48, volume: 2 },
    { at: 9, note: 48, volume: 1 },
  ] },
  // Short bright impact: three quick noise hits.
  burst: { name: 'hit', waveform: 'noise', rate: 2, decay: 0.3, cut: 0.8, notes: [
    { at: 0, note: 72, volume: 7 },
    { at: 1, note: 72, volume: 4 },
    { at: 2, note: 72, volume: 2 },
  ] },
  // Enemy death: a descending saw wail.
  skull: { name: 'enemy_die', waveform: 'saw', rate: 2, decay: 0.7, notes: [
    { at: 0, note: 72, volume: 7 },
    { at: 1, note: 69, volume: 6 },
    { at: 2, note: 65, volume: 6 },
    { at: 3, note: 62, volume: 5 },
    { at: 4, note: 58, volume: 4 },
    { at: 5, note: 55, volume: 3 },
  ] },
};

/**
 * Build a preset's sound: a fresh sequence with only the spec's notes
 * enabled (the rest stay rests), at a clear audition volume.
 */
export function buildPreset(spec: PresetSpec): SoundSequence {
  const sequence = createSoundSequence();
  sequence.steps.forEach((step) => { step.enabled = false; });
  spec.notes.forEach(({ at, note, volume }) => {
    const step = sequence.steps[at];
    step.note = note;
    step.volume = volume ?? 7;
    step.enabled = true;
  });
  sequence.waveform = spec.waveform;
  if (spec.rate !== undefined) sequence.rate = spec.rate;
  if (spec.decay !== undefined) sequence.decay = spec.decay;
  if (spec.cut !== undefined) sequence.cut = spec.cut;
  sequence.masterVolume = 0.5;
  return sequence;
}

/**
 * Load a preset into the bank's selected slot, replacing its sound and name.
 * The bank snapshots the slot first, so Undo restores exactly what was there.
 */
export function applyPreset(bank: SoundBank, key: PresetKey): void {
  const preset = PRESETS[key];
  bank.replaceSelected(buildPreset(preset), preset.name);
}
