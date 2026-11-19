import { Container, Graphics, Text } from 'pixi.js';
import { RaisedPanelFrame } from './ui/RaisedPanelFrame';
import { SoundBankRow } from './SoundBankRow';

const BANK_ITEMS = [
  'jump', 'coin', 'hit', 'laser', 'boom_big', 'power_up',
  'enemy_die', 'select', 'empty', 'empty', 'empty', 'empty',
] as const;
const ROW_HEIGHT = 16;
const SCROLL_BUTTON_SIZE = 16;

/** Right sound bank with twelve named/empty rows and scroll affordances. */
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
    style: { fontFamily: 'monospace', fontSize: 8, fontWeight: 'bold', fill: 0xffeaff },
  });
  title.position.set(16, 4);
  return title;
}

function createSubtitle(): Text {
  const subtitle = new Text({
    text: 'RUN → GAME',
    style: { fontFamily: 'monospace', fontSize: 8, fontWeight: 'bold', fill: 0xb88acb },
  });
  subtitle.position.set(16, 20);
  return subtitle;
}

function createRows(width: number): Container {
  const rows = new Container();
  rows.position.set(4, 32);
  BANK_ITEMS.forEach((name, index) => {
    const row = new SoundBankRow(index, name, name === 'laser', width - 40);
    row.position.y = index * ROW_HEIGHT;
    rows.addChild(row);
  });
  return rows;
}

function createScrollButtons(width: number, height: number): Container {
  const x = width - SCROLL_BUTTON_SIZE - 4;
  const scroll = new Container();
  scroll.addChild(createArrowButton(x, 32, true));
  scroll.addChild(createArrowButton(x, height - SCROLL_BUTTON_SIZE - 4, false));
  return scroll;
}

function createArrowButton(x: number, y: number, up: boolean): Graphics {
  const button = new Graphics()
    .rect(x + 2, y + 2, 16, 16).fill(0x140b20)
    .rect(x, y, 16, 16).fill(0x7c5ad1)
    .rect(x + 2, y + 2, 12, 2).fill(0xd6c6ff)
    .rect(x + 2, y + 2, 2, 10).fill(0xd6c6ff);

  const rows = up ? [
    { left: 7, y: 3, width: 2 },
    { left: 5, y: 5, width: 6 },
    { left: 3, y: 7, width: 10 },
    { left: 1, y: 9, width: 14 },
  ] : [
    { left: 1, y: 5, width: 14 },
    { left: 3, y: 7, width: 10 },
    { left: 5, y: 9, width: 6 },
    { left: 7, y: 11, width: 2 },
  ];
  rows.forEach((row) => button.rect(x + row.left, y + row.y, row.width, 2).fill(0xfff1f8));
  return button;
}
