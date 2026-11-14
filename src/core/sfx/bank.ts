import type { LiveChipId, SfxSound } from "./chips";
import { createDefaultSfxBank } from "./defaultBank";
import { parseSfxBank, serializeSfxBank, type SfxBank } from "./format";

export const CART_SFX_STORAGE_KEY = "beast2d-cart-sfx";

type Listener = () => void;

const listeners = new Set<Listener>();

let bank: SfxBank | null = null;

function readStored(): SfxBank | null {
  try {
    const raw = globalThis.localStorage?.getItem(CART_SFX_STORAGE_KEY);
    if (!raw) return null;
    return parseSfxBank(JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}

function persist(bankState: SfxBank): void {
  try {
    globalThis.localStorage?.setItem(CART_SFX_STORAGE_KEY, JSON.stringify(serializeSfxBank(bankState)));
  } catch {
    /* Private mode and tests without storage keep the in-memory bank. */
  }
}

function publish(): void {
  persist(bank);
  for (const listener of listeners) listener();
}

function bankHasContent(bankState: SfxBank): boolean {
  return bankState.slots.some((slot) => slot.name !== "empty" && slot.name !== "");
}

/**
 * Seeds the in-memory bank from localStorage, an optional cart file, or the built-in default.
 * Call once at startup before the editor or cart runs.
 */
export function initSfxBank(fileSeed?: unknown): void {
  const stored = readStored();
  if (stored) {
    bank = stored;
    return;
  }
  if (fileSeed !== undefined) {
    const fromFile = parseSfxBank(fileSeed);
    bank = bankHasContent(fromFile) ? fromFile : createDefaultSfxBank();
  } else {
    bank = createDefaultSfxBank();
  }
  persist(bank);
}

/** The live cart bank. Playback reads this object, so an edit is heard on the next sfx(). */
export function getSfxBank(): SfxBank {
  if (!bank) initSfxBank();
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
    globalThis.localStorage?.removeItem(CART_SFX_STORAGE_KEY);
  } catch {
    /* ignore */
  }
  for (const listener of listeners) listener();
}