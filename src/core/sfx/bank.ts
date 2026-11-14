import type { LiveChipId, SfxSound } from "./chips";
import { createDefaultSfxBank, parseSfxBank, serializeSfxBank, type SfxBank } from "./format";

const STORAGE_KEY = "beast2d-cart-sfx";

type Listener = () => void;

const listeners = new Set<Listener>();

function readStored(): SfxBank | null {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (!raw) return null;
    return parseSfxBank(JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}

function persist(bank: SfxBank): void {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(serializeSfxBank(bank)));
  } catch {
    /* Private mode and tests without storage keep the in-memory bank. */
  }
}

let bank: SfxBank = readStored() ?? createDefaultSfxBank();

function publish(): void {
  persist(bank);
  for (const listener of listeners) listener();
}

/** The live cart bank. Playback reads this object, so an edit is heard on the next sfx(). */
export function getSfxBank(): SfxBank {
  return bank;
}

export function replaceSfxBank(next: SfxBank): void {
  bank = next;
  publish();
}

export function updateSfxCartChip(chip: LiveChipId): void {
  bank.chip = chip;
  publish();
}

export function updateSfxSlot(index: number, edit: (sound: SfxSound) => void): void {
  const sound = bank.slots[index];
  if (!sound) return;
  edit(sound);
  publish();
}

export function subscribeSfxBank(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function resetSfxBank(next = createDefaultSfxBank()): void {
  bank = next;
  try {
    globalThis.localStorage?.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  for (const listener of listeners) listener();
}
