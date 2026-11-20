import { Container, Graphics, Text } from 'pixi.js';
import { SoundBankRow, BANK_ROW_HEIGHT } from './SoundBankRow';

const BANK_ITEMS = [
  'jump', 'coin', 'hit', 'laser', 'boom_big', 'power_up',
  'enemy_die', 'select', 'empty', 'empty', 'empty', 'empty',
] as const;
const BANK_ROW_TOP = 109 / 3;
const SCROLL_BUTTON_SIZE = 15;
const SCROLL_INSET = 2;

/** Shallow inset sound-bank area with a fine board-colored boundary. */
export class SoundBankPanel extends Container {
  constructor(width: number, height: number) {
    super();
    this.addChild(drawFlatBoundary(width, height));
    this.addChild(createTitle());
    this.addChild(createSubtitle());
    this.addChild(createRows(width));
    this.addChild(createScrollbar(width, height));
  }
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

function createSubtitle(): Text {
  const subtitle = new Text({
    text: 'RUN → GAME',
    style: { fontFamily: 'monogram', fontSize: 13, fill: 0xb88acb }, resolution: 3,
  });
  subtitle.position.set(6, 17);
  return subtitle;
}

function createRows(width: number): Container {
  const rows = new Container();
  rows.position.set(0, BANK_ROW_TOP);
  BANK_ITEMS.forEach((name, index) => {
    const row = new SoundBankRow(index, name, name === 'laser', width - 24);
    row.position.y = index * BANK_ROW_HEIGHT + (index === 3 ? 2 / 3 : 0);
    rows.addChild(row);
  });
  return rows;
}

function createScrollbar(width: number, height: number): Container {
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
  scrollbar.addChild(createArrowButton(x, y, true));
  scrollbar.addChild(createArrowButton(x, height - SCROLL_BUTTON_SIZE - SCROLL_INSET, false));
  return scrollbar;
}

function createArrowButton(x: number, y: number, up: boolean): Container {
  const button = new Container();
  button.addChild(new Graphics()
    .rect(x + 1, y + 1, 14, 14).fill(0x301b42)
    .rect(x, y, 14, 14).fill(0xc7b3d9)
    .rect(x + 1, y + 1, 12, 2).fill(0xe8dcf2)
    .rect(x + 1, y + 1, 2, 12).fill(0xe8dcf2)
    .rect(x + 11, y + 2, 2, 11).fill(0x8a63a0));
  const glyph = new Graphics();
  if (up) {
    glyph.poly([x + 7, y + 4, x + 11, y + 10, x + 3, y + 10]).fill(0x281638);
  } else {
    glyph.poly([x + 3, y + 4, x + 11, y + 4, x + 7, y + 10]).fill(0x281638);
  }
  button.addChild(glyph);
  return button;
}
