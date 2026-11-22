/**
 * Sound bank state: the board's named sound slots and the current selection.
 * Kept free of Pixi, like the audio model, so the same state drives the 2D
 * panel, the 3D overlays and later the export format. Selection changes are
 * pushed to subscribers; rendering components only read and select.
 */

/** One bank slot: a named sound, or an empty slot that cannot be selected yet. */
export interface BankSlot {
  /** Row label; empty slots display as 'empty'. */
  name: string;
  /** Empty slots show dimmed and ignore selection. */
  empty: boolean;
}

/**
 * The board's sixteen slots in display order: eight named game sounds, then
 * empty slots. Slot 01 is the first row. The names are placeholders until
 * slots hold real sounds.
 */
export const DEFAULT_BANK_SLOTS: readonly BankSlot[] = [
  ...(['jump', 'coin', 'hit', 'laser', 'boom_big', 'power_up', 'enemy_die', 'select']
    .map((name): BankSlot => ({ name, empty: false }))),
  ...Array.from({ length: 8 }, (): BankSlot => ({ name: 'empty', empty: true })),
];

/**
 * The bank's selection. Filled slots are selectable by tap or arrow keys;
 * empty slots are skipped. Listeners are notified only on an actual change.
 */
export class SoundBank {
  readonly slots: readonly BankSlot[];
  private _selectedIndex: number;
  private readonly listeners = new Set<(index: number) => void>();

  constructor(slots: readonly BankSlot[] = DEFAULT_BANK_SLOTS, selectedIndex = 3) {
    this.slots = slots;
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
   * Select a filled slot by row index. Empty or out-of-range slots are
   * ignored. Returns whether the selection changed.
   */
  select(index: number): boolean {
    const slot = this.slots[index];
    if (!slot || slot.empty || index === this._selectedIndex) return false;
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
   * Subscribe to selection changes; the listener gets the new slot index.
   * Returns an unsubscribe function.
   */
  onChange(listener: (index: number) => void): () => void {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }
}
