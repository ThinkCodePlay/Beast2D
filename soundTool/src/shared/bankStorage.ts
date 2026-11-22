import type { SoundSequence } from './audio/model.js';
import type { BankSlot, SoundBank } from './bank.js';
import { parseSoundData, soundToJson, type SoundFileData } from './soundFile.js';

/**
 * The bank's persistence snapshot: every slot's name, empty flag and sound,
 * plus the selection and the loop latch, as JSON in localStorage. Pixi-free,
 * like the sound file format; stored sounds follow exactly the import
 * format's validation (parseSoundData), so a snapshot is a row of sound
 * files under one envelope.
 *
 * localStorage is scoped to the page's origin (scheme + host + port), not
 * its path: every commit-pinned rawcdn.githack.com URL shares one origin, so
 * a snapshot written at one build's URL loads at the next build's URL. The
 * key is namespaced so unrelated pages on a shared host cannot collide.
 */

/** Format marker, so other JSON in the same key is rejected clearly. */
export const BANK_STORAGE_FORMAT = 'beast2d-sound-bank';
/** Snapshot version; newer versions are rejected, not guessed at. */
export const BANK_STORAGE_VERSION = 1;
/** The localStorage key the autosave writes and the restore reads. */
export const BANK_STORAGE_KEY = 'beast2d-sound-bank:v1';
/** A corrupt snapshot's raw text is copied to a key with this prefix before the board starts fresh. */
export const CORRUPT_BACKUP_PREFIX = `${BANK_STORAGE_KEY}:corrupt:`;

/** What a restore needs: the slots, the selection and the loop latch. */
export interface BankSnapshot {
  slots: BankSlot[];
  selectedIndex: number;
  looping: boolean;
}

/** Snapshot envelope shape (the slots' sounds reuse the sound-file shape). */
interface BankSnapshotData {
  format: typeof BANK_STORAGE_FORMAT;
  version: typeof BANK_STORAGE_VERSION;
  selectedIndex: number;
  looping: boolean;
  slots: { name: string; empty: boolean; sound: SoundFileData['sound'] }[];
}

/** Serialize the bank and the loop latch. Compact JSON: machines only read it. */
export function serializeBank(bank: SoundBank, looping: boolean): string {
  const data: BankSnapshotData = {
    format: BANK_STORAGE_FORMAT,
    version: BANK_STORAGE_VERSION,
    selectedIndex: bank.selectedIndex,
    looping,
    slots: bank.copySlots().map(slot => ({ name: slot.name, empty: slot.empty, sound: soundToJson(slot.sound) })),
  };
  return JSON.stringify(data);
}

/**
 * Parse a snapshot's text. Throws an Error with a user-readable message when
 * the text is not valid JSON, not this format, a newer version, or holds
 * out-of-shape values; sound values follow the sound file's clamp/strict
 * rules. Slot order and count are preserved as stored.
 */
export function parseBankSnapshot(text: string): BankSnapshot {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error('The saved data is not valid JSON.');
  }
  const data = raw as Partial<BankSnapshotData>;
  if (data?.format !== BANK_STORAGE_FORMAT) {
    throw new Error('The saved data is not a Beast2D sound bank snapshot.');
  }
  if (data.version !== BANK_STORAGE_VERSION) {
    throw new Error(`Unsupported snapshot version ${String(data.version)}.`);
  }
  if (!Array.isArray(data.slots) || data.slots.length === 0) {
    throw new Error('The saved data holds no slots.');
  }
  const slots: BankSlot[] = data.slots.map((slot, index) => {
    if (!slot || typeof slot !== 'object') throw new Error(`Saved slot ${index + 1} is not an object.`);
    if (typeof slot.name !== 'string') throw new Error(`Saved slot ${index + 1} has no name.`);
    return {
      name: slot.name,
      empty: slot.empty === true,
      sound: parseSoundData(slot.sound) as SoundSequence,
    };
  });
  const selectedIndex = typeof data.selectedIndex === 'number' && Number.isInteger(data.selectedIndex)
    ? data.selectedIndex
    : 0;
  return { slots, selectedIndex, looping: data.looping === true };
}
