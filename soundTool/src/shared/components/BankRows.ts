import { Container, Graphics, Text, type FederatedPointerEvent, type FederatedWheelEvent } from 'pixi.js';
import { VISIBLE_SLOT_ROWS, type SoundBank } from '../bank';
import { BANK_ROW_HEIGHT, SoundBankRow } from './SoundBankRow';

/** Rows' vertical offset inside the bank panel. */
export const BANK_ROW_TOP = 109 / 3;

/** The window's last row is the persistent "+ new" row. */
const ADD_ROW = VISIBLE_SLOT_ROWS;

/**
 * The bank's slot rows inside a scrolling window: up to VISIBLE_SLOT_ROWS
 * slots starting at the bank's scroll offset, then a persistent "+ new" row
 * that adds a sound (filling the first empty placeholder, else growing the
 * bank). Highlights the selected slot and follows every bank change. When
 * interactive, taps route through tapAt; the 3D scene instead hit-tests its
 * overlay mesh and routes the tap through the same tapAt.
 */
export class BankRows extends Container {
  constructor(private readonly bank: SoundBank, private readonly rowWidth: number, interactive = false) {
    super();
    this.renderRows();
    if (interactive) {
      this.eventMode = 'static';
      this.cursor = 'pointer';
      this.on('pointertap', (event: FederatedPointerEvent) => {
        this.tapAt(event.getLocalPosition(this).y);
      });
      this.on('wheel', (event: FederatedWheelEvent) => {
        bank.setScrollOffset(bank.scrollOffset + Math.sign(event.deltaY));
      });
    }
    bank.onChange(() => this.renderRows());
  }

  /**
   * The tap target at a local y, for pointer input in either renderer: the
   * "+ new" row adds a slot, any other row selects its slot (empty slots
   * ignore taps, per SoundBank).
   */
  tapAt(y: number): void {
    const windowRow = Math.floor(y / BANK_ROW_HEIGHT);
    if (windowRow === this.addRowIndex()) {
      this.bank.addSlot();
      return;
    }
    if (windowRow < 0 || windowRow > ADD_ROW) return;
    this.bank.select(this.bank.scrollOffset + windowRow);
  }

  /** Window row holding "+ new": after the last visible slot, capped at the window's last row. */
  private addRowIndex(): number {
    return Math.min(this.bank.slots.length - this.bank.scrollOffset, ADD_ROW);
  }

  /** Rebuild the window's rows to match the bank: visible slice plus "+ new". */
  private renderRows(): void {
    const { bank } = this;
    const offset = bank.scrollOffset;
    this.removeChildren().forEach(child => child.destroy());
    const last = Math.min(offset + ADD_ROW, bank.slots.length);
    for (let index = offset; index < last; index++) {
      const row = new SoundBankRow(index, bank.slots[index].name, index === bank.selectedIndex, this.rowWidth);
      // Row 04 sits 2/3px lower in the reference artwork.
      row.position.y = (index - offset) * BANK_ROW_HEIGHT + (index === 3 ? 2 / 3 : 0);
      this.addChild(row);
    }
    const add = createAddRow(this.rowWidth);
    add.position.y = this.addRowIndex() * BANK_ROW_HEIGHT;
    this.addChild(add);
  }
}

/** The persistent "+ new" row: a darker row face, with the label in the
 *  enabled-name color so it reads as an actionable row, not a disabled one. */
function createAddRow(width: number): Container {
  const row = new Container();
  row.addChild(new Graphics()
    .rect(5, 1, width - 1, BANK_ROW_HEIGHT - 1).fill(0x1b1027)
    .rect(4, 0, width - 1, BANK_ROW_HEIGHT - 1).fill(0x241332)
    .rect(4, 0, width - 1, 1).fill(0x3f2652)
    .rect(4, 0, 1, BANK_ROW_HEIGHT - 1).fill(0x3f2652)
    .rect(4, BANK_ROW_HEIGHT - 1, width - 1, 1).fill(0x180d24)
    .rect(4 + width - 1, 1, 1, BANK_ROW_HEIGHT - 2).fill(0x180d24));
  const label = new Text({
    text: '+ new',
    style: { fontFamily: 'monogram', fontSize: 15, fill: 0xffeaff }, resolution: 3,
  });
  label.anchor.set(0, 0.5);
  label.position.set(40, BANK_ROW_HEIGHT / 2 - 1); // aligned with the slot names
  row.addChild(label);
  return row;
}
