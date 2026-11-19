import { Container, Graphics, Text } from 'pixi.js';
import { RaisedPanelFrame } from './ui/RaisedPanelFrame';
import { SoundBankRow, BANK_ROW_HEIGHT } from './SoundBankRow';

const BANK_ITEMS = [
  'jump', 'coin', 'hit', 'laser', 'boom_big', 'power_up',
  'enemy_die', 'select', 'empty', 'empty', 'empty', 'empty',
] as const;
const BANK_ROW_TOP = 28;
const SCROLL_BUTTON_SIZE = 16;

/** Right-side sound list with twelve visible rows and separate scroll controls. */
export class SoundBankPanel extends Container {
  constructor(width: number, height: number) {
    super();
    this.addChild(new RaisedPanelFrame(width, height));
    this.addChild(createTitle());
    this.addChild(createSubtitle());
    this.addChild(createRows(width));
    this.addChild(createScrollButtons(width, height));
  }
}

function createTitle(): Text {
  const title = new Text({
    text: 'SOUND BANK',
    style: { fontFamily: 'monogram', fontSize: 14, fontWeight: 'bold', fill: 0xffeaff }, resolution: 3,
  });
  title.position.set(8, 3);
  return title;
}

function createSubtitle(): Text {
  const subtitle = new Text({
    text: 'RUN → GAME',
    style: { fontFamily: 'monogram', fontSize: 12, fontWeight: 'bold', fill: 0xb88acb }, resolution: 3,
  });
  subtitle.position.set(8, 17);
  return subtitle;
}

function createRows(width: number): Container {
  const rows = new Container();
  rows.position.set(4, BANK_ROW_TOP);
  BANK_ITEMS.forEach((name, index) => {
    const row = new SoundBankRow(index, name, name === 'laser', width - 24);
    row.position.y = index * BANK_ROW_HEIGHT;
    rows.addChild(row);
  });
  return rows;
}

function createScrollButtons(width: number, height: number): Container {
  const x = width - SCROLL_BUTTON_SIZE - 4;
  const scroll = new Container();
  scroll.addChild(createArrowButton(x, BANK_ROW_TOP, true));
  scroll.addChild(createArrowButton(x, height - SCROLL_BUTTON_SIZE - 4, false));
  return scroll;
}

function createArrowButton(x: number, y: number, up: boolean): Container {
  const button = new Container();
  button.addChild(new Graphics()
    .rect(x + 2, y + 2, 14, 14).fill(0x140b20)
    .rect(x, y, 14, 14).fill(0x7c5ad1)
    .rect(x + 2, y + 2, 10, 2).fill(0xd6c6ff)
    .rect(x + 2, y + 2, 2, 8).fill(0xd6c6ff));
  const glyph = new Text({
    text: up ? '▲' : '▼',
    style: { fontFamily: 'monogram', fontSize: 12, fontWeight: 'bold', fill: 0xfff1f8 }, resolution: 3,
  });
  glyph.anchor.set(0.5);
  glyph.position.set(x + 7, y + 7);
  button.addChild(glyph);
  return button;
}
