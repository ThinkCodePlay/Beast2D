import { Container, type FederatedPointerEvent } from 'pixi.js';
import type { SoundBank } from '../bank';
import { BANK_ROW_HEIGHT, SoundBankRow } from './SoundBankRow';

/** Rows' vertical offset inside the bank panel. */
export const BANK_ROW_TOP = 109 / 3;

/**
 * The bank's slot rows, in display order. Highlights the bank's selected
 * slot and follows selection changes. When interactive, a tap selects the
 * tapped row (empty slots ignore taps, per SoundBank); the 3D scene instead
 * hit-tests its overlay mesh and maps the tap through slotAt.
 */
export class BankRows extends Container {
  private readonly rows: SoundBankRow[];

  constructor(bank: SoundBank, width: number, interactive = false) {
    super();
    this.rows = bank.slots.map((slot, index) => {
      const row = new SoundBankRow(index, slot.name, index === bank.selectedIndex, width);
      // Row 04 sits 2/3px lower in the reference artwork.
      row.position.y = index * BANK_ROW_HEIGHT + (index === 3 ? 2 / 3 : 0);
      return row;
    });
    this.addChild(...this.rows);
    if (interactive) {
      this.eventMode = 'static';
      this.cursor = 'pointer';
      this.on('pointertap', (event: FederatedPointerEvent) => {
        bank.select(this.slotAt(event.getLocalPosition(this).y));
      });
    }
    bank.onChange(selected => {
      this.rows.forEach((row, index) => row.setSelected(index === selected));
    });
  }

  /** The slot index at a local y, for pointer input in either renderer. */
  slotAt(y: number): number {
    return Math.max(0, Math.min(this.rows.length - 1, Math.floor(y / BANK_ROW_HEIGHT)));
  }
}
