import { Container, Graphics, Text } from 'pixi.js';
import { SoundBankRow, BANK_ROW_HEIGHT } from './SoundBankRow';

const BANK_ITEMS = [
  'jump', 'coin', 'hit', 'laser', 'boom_big', 'power_up',
  'enemy_die', 'select', 'empty', 'empty', 'empty', 'empty',
] as const;
const BANK_ROW_TOP = 28;
const SCROLL_BUTTON_SIZE = 16;
const SCROLL_INSET = 4;

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
    .rect(0, 0, width, height).fill(0x40264f)
    .rect(0, 0, width, 1).fill(0x9b60b7)
    .rect(0, 0, 1, height).fill(0x9b60b7)
    .rect(1, height - 1, width - 1, 1).fill(0x301b42)
    .rect(width - 1, 1, 1, height - 2).fill(0x301b42)
    .rect(2, 25, width - 4, 1).fill(0x56316b);
}

function createTitle(): Text {
  const title = new Text({
    text: 'SOUND BANK',
    style: { fontFamily: 'monogram', fontSize: 16, fontWeight: 'bold', fill: 0xffeaff }, resolution: 3,
  });
  title.position.set(4, 3);
  return title;
}

function createSubtitle(): Text {
  const subtitle = new Text({
    text: 'RUN → GAME',
    style: { fontFamily: 'monogram', fontSize: 13, fill: 0xb88acb }, resolution: 3,
  });
  subtitle.position.set(4, 17);
  return subtitle;
}

function createRows(width: number): Container {
  const rows = new Container();
  rows.position.set(0, BANK_ROW_TOP);
  BANK_ITEMS.forEach((name, index) => {
    const row = new SoundBankRow(index, name, name === 'laser', width - 24);
    row.position.y = index * BANK_ROW_HEIGHT;
    rows.addChild(row);
  });
  return rows;
}

function createScrollbar(width: number, height: number): Container {
  const x = width - SCROLL_BUTTON_SIZE - SCROLL_INSET;
  const y = BANK_ROW_TOP;
  const trackHeight = height - y - SCROLL_INSET;
  const thumbHeight = trackHeight - SCROLL_BUTTON_SIZE * 2 - 10;
  const scrollbar = new Container();
  scrollbar.addChild(new Graphics()
    .rect(x, y + SCROLL_BUTTON_SIZE, SCROLL_BUTTON_SIZE, trackHeight - SCROLL_BUTTON_SIZE * 2)
    .fill(0x251531)
    .rect(x + 2, y + SCROLL_BUTTON_SIZE + 2, 2, trackHeight - SCROLL_BUTTON_SIZE * 2 - 4)
    .fill(0x906aa4)
    .rect(x + SCROLL_BUTTON_SIZE - 4, y + SCROLL_BUTTON_SIZE + 2, 2, trackHeight - SCROLL_BUTTON_SIZE * 2 - 4)
    .fill(0x1b1027)
    .rect(x + 2, y + SCROLL_BUTTON_SIZE + 5, SCROLL_BUTTON_SIZE - 4, thumbHeight)
    .fill(0xa581ba)
    .rect(x + 2, y + SCROLL_BUTTON_SIZE + 5, 2, thumbHeight).fill(0xd4bedc)
    .rect(x + SCROLL_BUTTON_SIZE - 4, y + SCROLL_BUTTON_SIZE + 5, 2, thumbHeight).fill(0x704584));
  scrollbar.addChild(createArrowButton(x, y, true));
  scrollbar.addChild(createArrowButton(x, height - SCROLL_BUTTON_SIZE - SCROLL_INSET, false));
  return scrollbar;
}

function createArrowButton(x: number, y: number, up: boolean): Container {
  const button = new Container();
  button.addChild(new Graphics()
    .rect(x + 2, y + 2, 12, 12).fill(0x301b42)
    .rect(x, y, 12, 12).fill(0x9c7caf)
    .rect(x + 2, y + 2, 8, 2).fill(0xd5bedf)
    .rect(x + 2, y + 2, 2, 6).fill(0xd5bedf)
    .rect(x + 10, y + 2, 2, 10).fill(0x1b1027));
  const glyph = new Text({
    text: up ? '▲' : '▼',
    style: { fontFamily: 'monogram', fontSize: 8, fill: 0xfff1f8 }, resolution: 3,
  });
  glyph.anchor.set(0.5);
  glyph.position.set(x + 6, y + 6);
  button.addChild(glyph);
  return button;
}
