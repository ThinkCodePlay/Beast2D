import { Container, Graphics, Text } from 'pixi.js';

const PANEL_DEEP = 0x29173a;
const TEXT = 0xffeaff;
const MUTED = 0xb88acb;
const HIGHLIGHT = 0xffcf72;

/** Self-contained right-side sound-bank list and bank actions. */
export class SoundBankPanel extends Container {
  constructor(width: number, height: number) {
    super();
    this.addChild(createPanel(width, height));
    this.addChild(createTitle());
    this.addChild(createBankList(width, height));
    this.addChild(createActions(width, height));
  }
}

function createPanel(width: number, height: number): Graphics {
  return new Graphics()
    .roundRect(0, 0, width, height, 4)
    .fill(PANEL_DEEP)
    .roundRect(0.5, 0.5, width - 1, height - 1, 4)
    .stroke({ color: 0xb875d0, width: 1 })
    .moveTo(1, 26)
    .lineTo(width - 1, 26)
    .stroke({ color: 0x70428a, width: 1 });
}

function createTitle(): Container {
  const title = new Container();
  const heading = makeText('SOUND BANK', 7, TEXT, true);
  heading.position.set(6, 5);
  const subtitle = makeText('RUN > GAME', 5, MUTED, true);
  subtitle.position.set(6, 17);
  title.addChild(heading, subtitle);
  return title;
}

function createBankList(width: number, height: number): Container {
  const list = new Container();
  const items = ['jump', 'coin', 'hit', 'laser', 'boom', 'power', 'enemy', 'select', 'empty'];
  const rowHeight = 15;
  const startY = 31;
  const availableRows = Math.max(1, Math.floor((height - startY - 25) / rowHeight));
  items.slice(0, availableRows).forEach((name, index) => {
    const y = startY + index * rowHeight;
    const selected = index === 3;
    const row = new Graphics()
      .rect(4, y, width - 8, rowHeight - 1)
      .fill(selected ? HIGHLIGHT : (index % 2 === 0 ? 0x38214c : 0x302044))
      .rect(4, y, 14, rowHeight - 1)
      .fill(selected ? 0xf2b954 : 0x251531)
      .moveTo(19, y + 1)
      .lineTo(19, y + rowHeight - 2)
      .stroke({ color: 0x76508c, width: 1 });
    const ink = selected ? 0x392044 : TEXT;
    const number = makeText(String(index + 1).padStart(2, '0'), 6, selected ? ink : MUTED, true);
    number.position.set(6, y + 4);
    const label = makeText(name, 6, name === 'empty' ? MUTED : ink, selected || name !== 'empty');
    label.position.set(22, y + 4);
    const play = makeText('▶', 6, selected ? ink : 0xd889ed, true);
    play.anchor.set(1, 0);
    play.position.set(width - 7, y + 4);
    list.addChild(row, number, label, play);
  });
  return list;
}

function createActions(width: number, height: number): Container {
  const actions = new Container();
  const y = height - 20;
  const gap = 4;
  const buttonWidth = (width - 12 - gap) / 2;
  const add = makeActionButton(4, y, buttonWidth, 'ADD');
  const save = makeActionButton(8 + buttonWidth, y, buttonWidth, 'SAVE');
  actions.addChild(add, save);
  return actions;
}

function makeActionButton(x: number, y: number, width: number, label: string): Container {
  const button = new Container();
  const face = new Graphics()
    .roundRect(x, y, width, 15, 3)
    .fill(0x724492)
    .roundRect(x, y, width, 15, 3)
    .stroke({ color: 0x29173a, width: 2 });
  const text = makeText(label, 6, TEXT, true);
  text.anchor.set(0.5);
  text.position.set(x + width / 2, y + 7);
  button.addChild(face, text);
  return button;
}

function makeText(value: string, size: number, color: number, bold = false): Text {
  return new Text({
    text: value,
    style: {
      fontFamily: 'monospace',
      fontSize: size,
      fontWeight: bold ? 'bold' : 'normal',
      fill: color,
    },
  });
}
