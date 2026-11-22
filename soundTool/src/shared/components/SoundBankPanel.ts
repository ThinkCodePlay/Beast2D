import { Container, Graphics, Text } from 'pixi.js';
import { makePressable } from '../ui/Pressable';
import type { ControlMode } from '../controls';
import type { SoundBank } from '../bank';
import type { SoundTransfer } from '../ui/soundFileTransfer';
import { BANK_ROW_TOP, BankRows } from './BankRows';
import { BANK_STRIP_BUTTON_SIZE, BankStripButton } from './BankStripButton';

/** Panel width kept clear of the rows (the scrollbar's side). */
export const ROWS_WIDTH_INSET = 24;
export const SCROLL_BUTTON_SIZE = 15;
export const SCROLL_INSET = 2;
export const SCROLL_TRACK_TOP = BANK_ROW_TOP;

/** The import/export buttons sit on the panel's subtitle strip. */
export const IO_BUTTON_TOP = 16;
export const IO_BUTTON_GAP = 2;

/**
 * The buttons' x positions inside the panel: export rightmost, import beside
 * it, undo leftmost. Shared with the 3D layout so the meshes land on the
 * same spots.
 */
export function stripButtonXs(width: number): { undoX: number; importX: number; exportX: number } {
  const exportX = width - SCROLL_INSET - BANK_STRIP_BUTTON_SIZE;
  const importX = exportX - BANK_STRIP_BUTTON_SIZE - IO_BUTTON_GAP;
  return { undoX: importX - BANK_STRIP_BUTTON_SIZE - IO_BUTTON_GAP, importX, exportX };
}

/** Shallow inset sound-bank area with a fine board-colored boundary. */
export class SoundBankPanel extends Container {
  constructor(width: number, height: number, bank: SoundBank | undefined, controls: ControlMode = '2d', io?: SoundTransfer) {
    super();
    this.addChild(drawFlatBoundary(width, height));
    this.addChild(createTitle());
    // In '3d' mode the rows and strip buttons are left out so the 3D
    // scene can draw and hit-test its own (see three/BankRows3D.ts and
    // BANK_STRIP_BUTTONS in three/controlLayout.ts).
    if (controls === '2d') {
      if (!bank) throw new Error('SoundBankPanel 2D mode needs the sound bank.');
      const rows = new BankRows(bank, width - ROWS_WIDTH_INSET, true);
      rows.position.set(0, BANK_ROW_TOP);
      this.addChild(rows);
      this.addChild(...createStripButtons(width, bank, io));
    }
    this.addChild(createScrollbar(width, height, controls));
  }
}

/**
 * The strip buttons: undo leftmost, greyed out while the bank has nothing
 * to restore, then import/export when a transfer is wired.
 */
function createStripButtons(width: number, bank: SoundBank, io?: SoundTransfer): BankStripButton[] {
  const { undoX, importX, exportX } = stripButtonXs(width);
  const undoButton = new BankStripButton('undo', () => bank.undoLast());
  undoButton.position.set(undoX, IO_BUTTON_TOP);
  undoButton.setEnabled(bank.canUndo);
  bank.onChange(() => undoButton.setEnabled(bank.canUndo));
  const buttons = [undoButton];
  if (io) {
    const importButton = new BankStripButton('import', io.importSelected);
    importButton.position.set(importX, IO_BUTTON_TOP);
    const exportButton = new BankStripButton('export', io.exportSelected);
    exportButton.position.set(exportX, IO_BUTTON_TOP);
    buttons.push(importButton, exportButton);
  }
  return buttons;
}

function drawFlatBoundary(width: number, height: number): Graphics {
  return new Graphics()
    .rect(0, 0, width, height).fill(0x2b153c)
    .rect(0, 0, width, 1).fill(0x76508c)
    .rect(0, 0, 1, height).fill(0x76508c)
    .rect(width - 1, 1, 1, height - 2).fill(0x2a1738)
    .rect(1, height - 1, width - 1, 1).fill(0x2a1738)
    .rect(1, 1, 1, 1).fill(0xd88ce7)
    .rect(width - 2, height - 2, 1, 1).fill(0x20132b)
    .rect(3, 16, width - 6, 13).fill(0x472b5c)
    .rect(3, 16, width - 6, 1).fill(0x5c3a73)
    .rect(1, 33, width - 2, 1).fill(0x56316b);
}

function createTitle(): Text {
  const title = new Text({
    text: 'SOUND BANK',
    style: { fontFamily: 'monogram', fontSize: 18, fontWeight: 'bold', fill: 0xffeaff, stroke: { color: 0x2a1440, width: 1 } }, resolution: 3,
  });
  title.position.set(6, -2);
  return title;
}

function createScrollbar(width: number, height: number, controls: ControlMode): Container {
  const x = width - SCROLL_BUTTON_SIZE - SCROLL_INSET;
  const y = BANK_ROW_TOP;
  const trackHeight = height - y - SCROLL_INSET;
  const thumbHeight = trackHeight - SCROLL_BUTTON_SIZE * 2 - 4;
  const scrollbar = new Container();
  // Reference scrollbar: one wide light-lavender track with a darker inset thumb.
  scrollbar.addChild(new Graphics()
    .rect(x, y + SCROLL_BUTTON_SIZE, SCROLL_BUTTON_SIZE, trackHeight - SCROLL_BUTTON_SIZE * 2)
    .fill(0x1b1027)
    .rect(x + 1, y + SCROLL_BUTTON_SIZE + 1, SCROLL_BUTTON_SIZE - 2, trackHeight - SCROLL_BUTTON_SIZE * 2 - 2)
    .fill(0xa581ba)
    .rect(x + 2, y + SCROLL_BUTTON_SIZE + 2, 2, trackHeight - SCROLL_BUTTON_SIZE * 2 - 4)
    .fill(0xd4bedc)
    .rect(x + 4, y + SCROLL_BUTTON_SIZE + 2, SCROLL_BUTTON_SIZE - 8, thumbHeight)
    .fill(0x8a63a0)
    .rect(x + 4, y + SCROLL_BUTTON_SIZE + 2, SCROLL_BUTTON_SIZE - 8, 1).fill(0xb18cc4));
  if (controls === '2d') {
    const up = new ScrollArrowButton(true);
    up.position.set(x, y);
    const down = new ScrollArrowButton(false);
    down.position.set(x, height - SCROLL_BUTTON_SIZE - SCROLL_INSET);
    scrollbar.addChild(up, down);
  }
  return scrollbar;
}

/** Small square bank-scroll button with a chunky arrow glyph. */
export class ScrollArrowButton extends Container {
  constructor(up: boolean) {
    super();
    this.addChild(new Graphics()
      .rect(1, 1, 14, 14).fill(0x301b42)
      .rect(0, 0, 14, 14).fill(0xc7b3d9)
      .rect(1, 1, 12, 2).fill(0xe8dcf2)
      .rect(1, 1, 2, 12).fill(0xe8dcf2)
      .rect(11, 2, 2, 11).fill(0x8a63a0));
    const glyph = new Graphics();
    if (up) {
      glyph.poly([7, 4, 11, 10, 3, 10]).fill(0x281638);
    } else {
      glyph.poly([3, 4, 11, 4, 7, 10]).fill(0x281638);
    }
    this.addChild(glyph);
    makePressable(this, { pressDepth: 1 });
  }
}
