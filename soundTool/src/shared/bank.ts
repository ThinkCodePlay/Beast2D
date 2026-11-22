import {
  copySoundSequence,
  createSoundSequence,
  type SoundSequence,
} from "./audio/model.js";

/**
 * Sound bank state: the board's named sound slots and the current selection.
 * Kept free of Pixi, like the audio model, so the same state drives the 2D
 * panel, the 3D overlays and later the export format. Selection changes are
 * pushed to subscribers; rendering components only read and select.
 *
 * Each slot holds its own sound (notes, waveform and dial settings). The
 * editor works on one live SoundSequence; switching slots copies the outgoing
 * slot's sound out and the incoming slot's sound in, in place.
 *
 * Editing history: every sound or bank mutation is undoable, not just
 * replacements. One-shot bank edits (rename, preset or import replacement,
 * add/duplicate/delete slot) record themselves. Continuous editor gestures
 * (painting notes or volumes, turning a dial) bracket themselves with
 * beginEdit()/endEdit(): the whole stroke is one undo step, and a stroke
 * that changed nothing records nothing. Undo/redo restore whole-bank
 * snapshots - slots and selection - so every kind of edit reverts coherently,
 * and a new edit clears the redo stack. History is capped at HISTORY_LIMIT.
 */

/** Longest sound name the LCD and bank row take. */
export const MAX_NAME_LENGTH = 14;

/** Deepest editing history kept: one whole-bank snapshot per edit. */
export const HISTORY_LIMIT = 50;

/**
 * Slot rows the bank panel shows at once. The window's last row is the
 * persistent "+ new" row, so at most this many minus one slots are visible;
 * beyond that the window scrolls.
 */
export const VISIBLE_SLOT_ROWS = 15;

/** One undoable edit: the whole bank as it was before the edit. */
interface HistoryEntry {
  slots: BankSlot[];
  selectedIndex: number;
}

/**
 * The editing-history session the editor's gesture controls use: beginEdit()
 * before the gesture's first change, endEdit() after its last. SoundBank
 * implements it; components take the narrow interface so they never touch
 * the bank's selection API.
 */
export interface EditSession {
  beginEdit(): void;
  endEdit(): void;
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
  ...[
    "jump",
    "coin",
    "hit",
    "laser",
    "boom_big",
    "power_up",
    "enemy_die",
    "select",
  ].map((name): BankSlotData => ({ name, empty: false })),
  ...Array.from({ length: 8 }, (): BankSlotData => ({
    name: "empty",
    empty: true,
  })),
];

/**
 * The bank's selection and per-slot sounds. Filled slots are selectable by
 * tap or arrow keys; empty slots are skipped. Listeners are notified on an
 * actual selection change, a rename of the selected slot, or a committed
 * edit (so undo/redo availability and the rows stay current).
 */
export class SoundBank implements EditSession {
  slots: readonly BankSlot[];
  private _selectedIndex: number;
  private _scrollOffset = 0;
  private readonly createSound: () => SoundSequence;
  private active?: SoundSequence;
  private readonly undoStack: HistoryEntry[] = [];
  private readonly redoStack: HistoryEntry[] = [];
  private pendingEdit?: HistoryEntry;
  private readonly listeners = new Set<(index: number) => void>();

  /**
   * @param createSound Factory for a slot's starting sound; every slot gets
   * its own copy. Called once per slot at construction.
   */
  constructor(
    createSound: () => SoundSequence,
    selectedIndex = 3,
    slots: readonly BankSlotData[] = DEFAULT_BANK_SLOTS,
  ) {
    this.createSound = createSound;
    this.slots = slots.map((slot) => ({ ...slot, sound: createSound() }));
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
   * slot's sound loads into the editor. Selection itself is not an undoable
   * edit. Returns whether the selection changed.
   */
  select(index: number): boolean {
    const slot = this.slots[index];
    if (!slot || slot.empty || index === this._selectedIndex) return false;
    if (this.active) {
      copySoundSequence(this.active, this.slots[this._selectedIndex].sound);
      copySoundSequence(slot.sound, this.active);
    }
    this._selectedIndex = index;
    this.listeners.forEach((listener) => listener(index));
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
   * MAX_NAME_LENGTH; an empty result keeps the old name. Undoable. Returns
   * whether the name changed.
   */
  rename(name: string): boolean {
    const clean = name.trim().slice(0, MAX_NAME_LENGTH);
    const slot = this.slots[this._selectedIndex];
    if (!clean || clean === slot.name) return false;
    this.beginEdit();
    slot.name = clean;
    this.endEdit();
    return true;
  }

  /**
   * Replace the selected slot's sound and name, as an import or preset does.
   * Copies the incoming sound into the slot and into the live editor
   * sequence, so the board plays and shows the new sound at once. A blank
   * name keeps the old one. Undoable. Notifies listeners once, so views
   * refresh like a slot switch.
   */
  replaceSelected(sound: SoundSequence, name: string): void {
    this.beginEdit();
    const slot = this.slots[this._selectedIndex];
    copySoundSequence(sound, slot.sound);
    if (this.active) copySoundSequence(sound, this.active);
    const clean = name.trim().slice(0, MAX_NAME_LENGTH);
    if (clean) slot.name = clean;
    this.endEdit();
  }

  /**
   * Deep copy of every slot, with the live editor's edits folded into the
   * selected one first: what a persistence snapshot should store.
   */
  copySlots(): BankSlot[] {
    return this.slots.map((slot, index) => {
      const sound = createSoundSequence();
      copySoundSequence(
        index === this._selectedIndex && this.active ? this.active : slot.sound,
        sound,
      );
      return { name: slot.name, empty: slot.empty, sound };
    });
  }

  /**
   * Replace the whole bank with restored slots and selection, as loading a
   * persistence snapshot or a whole-bank file does. The live editor sequence
   * loads the restored selection's sound. The editing history survives the
   * restore (snapshots are whole-bank, so earlier entries stay valid);
   * bracket the call with beginEdit()/endEdit() to make the restore itself
   * undoable, as the whole-bank import does.
   */
  restore(slots: readonly BankSlot[], selectedIndex: number): void {
    this.slots = slots.map((slot) => {
      const sound = createSoundSequence();
      copySoundSequence(slot.sound, sound);
      return {
        name: slot.name.trim().slice(0, MAX_NAME_LENGTH) || slot.name,
        empty: slot.empty,
        sound,
      };
    });
    const wanted = this.slots[selectedIndex];
    this._selectedIndex =
      wanted && !wanted.empty
        ? selectedIndex
        : Math.max(
            0,
            this.slots.findIndex((slot) => !slot.empty),
          );
    this._scrollOffset = 0;
    if (this.active)
      copySoundSequence(this.slots[this._selectedIndex].sound, this.active);
    this.ensureVisible(this._selectedIndex);
    this.listeners.forEach((listener) => listener(this._selectedIndex));
  }

  /**
   * First slot index shown in the panel's row window. The window holds
   * VISIBLE_SLOT_ROWS slots plus the "+ new" row.
   */
  get scrollOffset(): number {
    return this._scrollOffset;
  }

  /** Largest meaningful offset: the window's last slot row shows the last slot. */
  get maxScrollOffset(): number {
    return Math.max(0, this.slots.length - VISIBLE_SLOT_ROWS);
  }

  /** Scroll the row window. Offsets clamp to the meaningful range. */
  setScrollOffset(offset: number): void {
    const next = Math.max(
      0,
      Math.min(this.maxScrollOffset, Math.round(offset)),
    );
    if (next === this._scrollOffset) return;
    this._scrollOffset = next;
    this.listeners.forEach((listener) => listener(this._selectedIndex));
  }

  /** Scroll only as far as needed to put a slot inside the window. */
  ensureVisible(index: number): void {
    if (index < this._scrollOffset) this.setScrollOffset(index);
    else if (index >= this._scrollOffset + VISIBLE_SLOT_ROWS)
      this.setScrollOffset(index - VISIBLE_SLOT_ROWS + 1);
  }

  /**
   * Add a sound through the bank's "+ new" row: fill the first empty
   * placeholder slot, or grow the bank when every slot holds a sound. The
   * new slot gets an automatic name (renameable on the LCD) and becomes the
   * selection, scrolled into view. Undoable. Returns its row index.
   */
  addSlot(): number {
    this.beginEdit();
    let index = this.slots.findIndex((slot) => slot.empty);
    if (index === -1) {
      index = this.slots.length;
      (this.slots as BankSlot[]).push({
        name: "",
        empty: true,
        sound: this.createSound(),
      });
    }
    const slot = this.slots[index] as BankSlot;
    slot.empty = false;
    slot.name = `sound_${String(index + 1).padStart(2, "0")}`.slice(
      0,
      MAX_NAME_LENGTH,
    );
    this.select(index);
    this.ensureVisible(index);
    this.endEdit();
    return index;
  }

  /** Whether undo() has an edit to restore. */
  get canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  /** Whether redo() has an undone edit to re-apply. */
  get canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  /**
   * Start an editing gesture: snapshot the bank so endEdit() can record the
   * whole gesture as one undo step. One-shot edits call beginEdit() and
   * endEdit() around their mutation; gesture controls (the pitch grid, the
   * volume row, the dials) call beginEdit() on press and endEdit() on
   * release. A nested beginEdit() keeps the original snapshot.
   */
  beginEdit(): void {
    this.pendingEdit ??= this.capture();
  }

  /**
   * Finish an editing gesture: when the bank actually changed since
   * beginEdit(), record the pre-edit snapshot as one undo step and clear the
   * redo stack. A gesture that changed nothing records nothing.
   */
  endEdit(): void {
    const pending = this.pendingEdit;
    this.pendingEdit = undefined;
    if (!pending) return;
    if (historyEntriesEqual(pending, this.capture())) return;
    this.undoStack.push(pending);
    if (this.undoStack.length > HISTORY_LIMIT) this.undoStack.shift();
    this.redoStack.length = 0;
    this.listeners.forEach((listener) => listener(this._selectedIndex));
  }

  /**
   * Restore the bank from before the most recent edit: names, notes,
   * waveform and dials on every slot, with the edit's slot selected again.
   * The current state moves to the redo stack. Returns whether anything was
   * restored.
   */
  undo(): boolean {
    const entry = this.undoStack.pop();
    if (!entry) return false;
    this.redoStack.push(this.capture());
    this.pendingEdit = undefined; // An open gesture's snapshot is stale now.
    this.restore(entry.slots, entry.selectedIndex);
    return true;
  }

  /**
   * Re-apply the most recently undone edit. Returns whether anything was
   * re-applied.
   */
  redo(): boolean {
    const entry = this.redoStack.pop();
    if (!entry) return false;
    this.undoStack.push(this.capture());
    this.pendingEdit = undefined; // An open gesture's snapshot is stale now.
    this.restore(entry.slots, entry.selectedIndex);
    return true;
  }

  /**
   * Subscribe to selection, rename and committed-edit changes; the listener
   * gets the selected slot index. Returns an unsubscribe function.
   */
  onChange(listener: (index: number) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /** The bank as one history snapshot: every slot plus the selection. */
  private capture(): HistoryEntry {
    return { slots: this.copySlots(), selectedIndex: this._selectedIndex };
  }
}

/** Two history snapshots match when slots and selection are all equal. */
function historyEntriesEqual(a: HistoryEntry, b: HistoryEntry): boolean {
  if (a.selectedIndex !== b.selectedIndex) return false;
  if (a.slots.length !== b.slots.length) return false;
  return a.slots.every(
    (slot, index) =>
      slot.name === b.slots[index].name &&
      slot.empty === b.slots[index].empty &&
      soundsEqual(slot.sound, b.slots[index].sound),
  );
}

/** Field-by-field sound equality, steps included. */
function soundsEqual(a: SoundSequence, b: SoundSequence): boolean {
  return (
    a.rate === b.rate &&
    a.waveform === b.waveform &&
    a.masterVolume === b.masterVolume &&
    a.pan === b.pan &&
    a.decay === b.decay &&
    a.pitch === b.pitch &&
    a.cut === b.cut &&
    a.steps.every(
      (step, index) =>
        step.note === b.steps[index].note &&
        step.volume === b.steps[index].volume &&
        step.enabled === b.steps[index].enabled,
    )
  );
}
