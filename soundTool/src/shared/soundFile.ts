import {
  createSoundSequence,
  NOTE_RANGE,
  SEQUENCE_STEP_COUNT,
  toStepVolume,
  WAVEFORM_TYPES,
  type SoundSequence,
  type WaveformType,
} from './audio/model.js';
import { validRate } from './audio/rate.js';

/**
 * The sound file format behind the bank's import/export buttons. Pixi-free,
 * like the audio model and the bank, so the same code serializes in either
 * renderer and stays unit-testable. A file holds one sound: the slot's name
 * plus every value of its SoundSequence, as human-readable JSON.
 */

/** Format marker, so a wrong JSON file is rejected with a clear message. */
export const SOUND_FILE_FORMAT = 'beast2d-sound';
/** Format version; files with a newer version are rejected, not guessed at. */
export const SOUND_FILE_VERSION = 1;

/** Whole-sound pitch shift accepted on import, in semitones. */
const PITCH_RANGE = { min: -48, max: 48 } as const;

/** The file's shape: a named snapshot of one SoundSequence. */
export interface SoundFileData {
  format: typeof SOUND_FILE_FORMAT;
  version: typeof SOUND_FILE_VERSION;
  name: string;
  sound: {
    rate: number;
    waveform: WaveformType;
    masterVolume: number;
    pan: number;
    decay: number;
    pitch: number;
    cut: number;
    steps: { note: number; volume: number; enabled: boolean }[];
  };
}

/** Serialize one sound with its slot name, pretty-printed for hand editing. */
export function serializeSound(name: string, sound: SoundSequence): string {
  const data: SoundFileData = {
    format: SOUND_FILE_FORMAT,
    version: SOUND_FILE_VERSION,
    name,
    sound: {
      rate: sound.rate,
      waveform: sound.waveform,
      masterVolume: sound.masterVolume,
      pan: sound.pan,
      decay: sound.decay,
      pitch: sound.pitch,
      cut: sound.cut,
      steps: sound.steps.map(step => ({ note: step.note, volume: step.volume, enabled: step.enabled })),
    },
  };
  return `${JSON.stringify(data, null, 2)}\n`;
}

/**
 * Parse a sound file's text into a name and a complete SoundSequence.
 * Throws an Error with a user-readable message when the file is not valid
 * JSON, not this format, or holds out-of-shape values. Forgiving where a
 * clamp is harmless (dial ranges, step volumes), strict where a guess would
 * change the music (notes, waveform, step count). Notes are validated as
 * numbers in the MIDI range, not rounded: the board's own grid stores
 * fractional semitone positions, and export must round-trip them exactly.
 */
export function parseSoundFile(text: string): { name: string; sound: SoundSequence } {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error('The file is not valid JSON.');
  }
  const data = raw as Partial<SoundFileData>;
  if (data?.format !== SOUND_FILE_FORMAT) {
    throw new Error('The file is not a Beast2D sound file.');
  }
  if (data.version !== SOUND_FILE_VERSION) {
    throw new Error(`Unsupported sound file version ${String(data.version)}.`);
  }
  const sound = parseSound(data.sound);
  const name = typeof data.name === 'string' ? data.name.trim() : '';
  return { name, sound };
}

/** Validate the file's sound object onto a fresh sequence's defaults. */
function parseSound(raw: SoundFileData['sound'] | undefined): SoundSequence {
  if (!raw || typeof raw !== 'object') throw new Error('The file has no sound data.');
  if (!Array.isArray(raw.steps) || raw.steps.length !== SEQUENCE_STEP_COUNT) {
    throw new Error(`The file needs exactly ${SEQUENCE_STEP_COUNT} steps.`);
  }
  const sound = createSoundSequence();
  sound.rate = validRate(numberOr(raw.rate, 1));
  sound.waveform = parseWaveform(raw.waveform);
  sound.masterVolume = clamp01(numberOr(raw.masterVolume, sound.masterVolume));
  sound.pan = clamp01(numberOr(raw.pan, sound.pan));
  sound.decay = clamp01(numberOr(raw.decay, sound.decay));
  sound.cut = clamp01(numberOr(raw.cut, sound.cut));
  sound.pitch = clamp(numberOr(raw.pitch, 0), PITCH_RANGE.min, PITCH_RANGE.max);
  raw.steps.forEach((step, index) => {
    if (!step || typeof step !== 'object') throw new Error(`Step ${index + 1} is not an object.`);
    const note = Number(step.note);
    if (!Number.isFinite(note) || note < NOTE_RANGE.min || note > NOTE_RANGE.max) {
      throw new Error(`Step ${index + 1} has an invalid note.`);
    }
    sound.steps[index] = {
      note,
      volume: toStepVolume(numberOr(step.volume, 7)),
      enabled: step.enabled !== false,
    };
  });
  return sound;
}

/** A finite number, or the fallback when the value is missing or not numeric. */
function numberOr(value: unknown, fallback: number): number {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

/** A waveform name from the file, or a clear error. */
function parseWaveform(value: unknown): WaveformType {
  if (WAVEFORM_TYPES.includes(value as WaveformType)) return value as WaveformType;
  throw new Error(`Unknown waveform "${String(value)}".`);
}

function clamp01(value: number): number {
  return clamp(value, 0, 1);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** A safe download filename for a slot name: lowercase ASCII plus .json. */
export function soundFileName(name: string): string {
  const base = name.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '_').replace(/^_+|_+$/g, '');
  return `${base || 'sound'}.json`;
}
