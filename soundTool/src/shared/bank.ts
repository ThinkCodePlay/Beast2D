import { copySoundSequence, createSoundSequence, type SoundSequence } from './audio/model.js';

/**
 * Sound bank state: the board's named sound slots and the current selection.
 * Kept free of Pixi, like the audio model, so the same state drives the 2D
 * panel, the 3D overlays and later the export format. Selection changes are
 * pushed to subscribers; rendering components only read and select.
 *
 * Each slot holds its own sound (notes, waveform and dial settings). The
 * editor works on one live SoundSequence; switching slots copies the outgoing
 * slot's sound out and the incoming slot's sound in, in place. Everything is
 * in memory: nothing persists across a reload yet.
 *
 * Replacing a slot's sound (import, preset) snapshots the slot first, so
 * undoLast() restores exactly what was there: name, notes, waveform and
 * dials. The history is single-purpose and shallow: replacements only,
 * capped at UNDO_LIMIT entries.
 */

/** Longest sound name the LCD and bank row take. */
export const MAX_NAME_LENGTH = 14;

/** Deepest undo history kept: one entry per replaced slot. */
export const UNDO_LIMIT = 10;

/** One undoable replacement: the slot's whole state before it was replaced. */
interface UndoEntry {
  /** Row the replacement happened on; Undo restores and re-selects it. */
  index: number;
  name: string;
  sound: SoundSequence;
}

/** Slot data without its sound: what the static defaults describe. */
export interface BankSlotData {
  /** Row label; empty slots display as 'empty'. */
  name: string;
  /** Empty slots show dimmed and ignore selection. */
  empty: boolean;
}

/** One bank slot: a named sound, or an empty slot that cannot be selected yet. */
export interface BankSlot extends BankSlotData {
  /** The slot's own sound, kept whole across selection switches. */
  sound: SoundSequence;
}

/**
 * The board's sixteen slots in display order: eight named game sounds, then
 * empty slots. Slot 01 is the first row. The names are placeholders the user
 * can rename on the LCD.
 */
export const DEFAULT_BANK_SLOTS: readonly BankSlotData[] = [
  ...(['jump', 'coin', 'hit', 'laser', 'boom_big', 'power_up', 'enemy_die', 'select']
    .map((name): BankSlotData => ({ name, empty: false }))),
  ...Array.from({ length: 8 }, (): BankSlotData => ({ name: 'empty', empty: true })),
];

/**
 * The bank's selection and per-slot sounds. Filled slots are selectable by
 * tap or arrow keys; empty slots are skipped. Listeners are notified on an
 * actual selection change or a rename of the selected slot.
 */
export class SoundBank {
  slots: readonly BankSlot[];
  private _selectedIndex: number;
  private active?: SoundSequence;
  private readonly undoStack: UndoEntry[] = [];
  private readonly listeners = new Set<(index: number) => void>();

  /**
   * @param createSound Factory for a slot's starting sound; every slot gets
   * its own copy. Called once per slot at construction.
   */
  constructor(createSound: () => SoundSequence, selectedIndex = 3, slots: readonly BankSlotData[] = DEFAULT_BANK_SLOTS) {
    this.slots = slots.map(slot => ({ ...slot, sound: createSound() }));
    this._selectedIndex = selectedIndex;
  }

  /** Selected slot's row index (0-based; row 01 is index 0). */
  get selectedIndex(): number {
    return this._selectedIndex;
  }

  /** Selected slot's name, shown on the sound-name LCD. */
  get selectedName(): string {
    return this.slots[this._selectedIndex].name;
  }

  /**
   * Bind the editor's live sequence and load the selected slot's sound into
   * it. Call once at startup, after the sequence exists.
   */
  activate(sequence: SoundSequence): void {
    this.active = sequence;
    copySoundSequence(this.slots[this._selectedIndex].sound, sequence);
  }

  /**
   * Select a filled slot by row index. Empty or out-of-range slots are
   * ignored. The outgoing slot keeps the editor's current sound; the incoming
   * slot's sound loads into the editor. Returns whether the selection
   * changed.
   */
  select(index: number): boolean {
    const slot = this.slots[index];
    if (!slot || slot.empty || index === this._selectedIndex) return false;
    if (this.active) {
      copySoundSequence(this.active, this.slots[this._selectedIndex].sound);
      copySoundSequence(slot.sound, this.active);
    }
    this._selectedIndex = index;
    this.listeners.forEach(listener => listener(index));
    return true;
  }

  /**
   * Move the selection by one filled slot in the delta's direction, stopping
   * at the list's edges (no wrap). Used by the up/down arrow keys. Returns
   * whether the selection changed.
   */
  selectNext(delta: number): boolean {
    const step = delta > 0 ? 1 : -1;
    let index = this._selectedIndex;
    for (;;) {
      index += step;
      if (index < 0 || index >= this.slots.length) return false;
      if (!this.slots[index].empty) return this.select(index);
    }
  }

  /**
   * Rename the selected slot. The name is trimmed and capped at
   * MAX_NAME_LENGTH; an empty result keeps the old name. Returns whether the
   * name changed.
   */
  rename(name: string): boolean {
    const clean = name.trim().slice(0, MAX_NAME_LENGTH);
    const slot = this.slots[this._selectedIndex];
    if (!clean || clean === slot.name) return false;
    slot.name = clean;
    this.listeners.forEach(listener => listener(this._selectedIndex));
    return true;
  }

  /**
   * Replace the selected slot's sound and name, as an import does. Copies
   * the incoming sound into the slot and into the live editor sequence, so
   * the board plays and shows the new sound at once. A blank name keeps the
   * old one. Notifies listeners once, so views refresh like a slot switch.
   */
  replaceSelected(sound: SoundSequence, name: string): void {
    const slot = this.slots[this._selectedIndex];
    this.pushUndo();
    copySoundSequence(sound, slot.sound);
    if (this.active) copySoundSequence(sound, this.active);
    const clean = name.trim().slice(0, MAX_NAME_LENGTH);
    if (clean) slot.name = clean;
    this.listeners.forEach(listener => listener(this._selectedIndex));
  }

  /**
   * Deep copy of every slot, with the live editor's edits folded into the
   * selected one first: what a persistence snapshot should store.
   */
  copySlots(): BankSlot[] {
    return this.slots.map((slot, index) => {
      const sound = createSoundSequence();
      copySoundSequence(index === this._selectedIndex && this.active ? this.active : slot.sound, sound);
      return { name: slot.name, empty: slot.empty, sound };
    });
  }

  /**
   * Replace the whole bank with restored slots and selection, as loading a
   * persistence snapshot does. The live editor sequence loads the restored
   * selection's sound and the undo history starts fresh: undo entries refer
   * to slot states from before the restore.
   */
  restore(slots: readonly BankSlot[], selectedIndex: number): void {
    this.slots = slots.map(slot => {
      const sound = createSoundSequence();
      copySoundSequence(slot.sound, sound);
      return { name: slot.name.trim().slice(0, MAX_NAME_LENGTH) || slot.name, empty: slot.empty, sound };
    });
    const wanted = this.slots[selectedIndex];
    this._selectedIndex = wanted && !wanted.empty
      ? selectedIndex
      : Math.max(0, this.slots.findIndex(slot => !slot.empty));
    this.undoStack.length = 0;
    if (this.active) copySoundSequence(this.slots[this._selectedIndex].sound, this.active);
    this.listeners.forEach(listener => listener(this._selectedIndex));
  }

  /** Whether undoLast() has a replacement to restore. */
  get canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  /**
   * Restore the slot state from before the most recent replacement: name,
   * notes, waveform and dials. The restored slot becomes the selection, even
   * if the user moved on after the replacement. Returns whether anything was
   * restored.
   */
  undoLast(): boolean {
    const entry = this.undoStack.pop();
    if (!entry) return false;
    // Flush live edits back into the current slot first, as a switch does.
    if (this.active) copySoundSequence(this.active, this.slots[this._selectedIndex].sound);
    const slot = this.slots[entry.index];
    copySoundSequence(entry.sound, slot.sound);
    slot.name = entry.name;
    this._selectedIndex = entry.index;
    if (this.active) copySoundSequence(entry.sound, this.active);
    this.listeners.forEach(listener => listener(entry.index));
    return true;
  }

  /**
   * Subscribe to selection and rename changes; the listener gets the selected
   * slot index. Returns an unsubscribe function.
   */
  onChange(listener: (index: number) => void): () => void {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }

  /** Snapshot the selected slot before a replacement, for undoLast(). */
  private pushUndo(): void {
    const slot = this.slots[this._selectedIndex];
    const snapshot = createSoundSequence();
    // The live sequence holds the slot's current sound while it is selected.
    copySoundSequence(this.active ?? slot.sound, snapshot);
    this.undoStack.push({ index: this._selectedIndex, name: slot.name, sound: snapshot });
    if (this.undoStack.length > UNDO_LIMIT) this.undoStack.shift();
  }
}
