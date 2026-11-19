import { Container, Graphics, Text } from 'pixi.js';

export const BANK_ROW_HEIGHT = 14;
const ROW_LEFT = 4;
const NAME_LEFT = 24;

/** One numbered sound-bank slot with an individual thin outline and cell rules. */
export class SoundBankRow extends Container {
  constructor(index: number, name: string, selected: boolean, width: number) {
    super();
    this.addChild(drawRow(selected, width));
    this.addChild(createIndex(index, selected));
    this.addChild(createName(name, selected));
    this.addChild(createPreviewGlyph(width, selected));
  }
}

function drawRow(selected: boolean, width: number): Graphics {
  const fill = selected ? 0xffcf72 : 0x38214c;
  const divider = selected ? 0x9a5b3c : 0x76508c;
  return new Graphics()
    .rect(ROW_LEFT, 0, width, BANK_ROW_HEIGHT).fill(0x24152e)
    .rect(ROW_LEFT + 1, 1, width - 2, BANK_ROW_HEIGHT - 2).fill(fill)
    .rect(ROW_LEFT + 1, 1, 16, BANK_ROW_HEIGHT - 2).fill(selected ? 0xf0b84f : 0x251531)
    .rect(ROW_LEFT + 1, 1, width - 2, 1).fill(selected ? 0xffe295 : 0x76508c)
    .rect(ROW_LEFT + 1, BANK_ROW_HEIGHT - 2, width - 2, 1).fill(selected ? 0xa46139 : 0x251531)
    .moveTo(ROW_LEFT + 17, 1).lineTo(ROW_LEFT + 17, BANK_ROW_HEIGHT - 1)
    .stroke({ color: divider, width: 1 })
    .moveTo(width - 32, 2).lineTo(width - 32, BANK_ROW_HEIGHT - 2)
    .stroke({ color: divider, width: 1 });
}

function createIndex(index: number, selected: boolean): Text {
  const label = createText(String(index + 1).padStart(2, '0'), selected ? 0x392044 : 0xb88acb);
  label.anchor.set(0, 0.5);
  label.position.set(ROW_LEFT, BANK_ROW_HEIGHT / 2);
  return label;
}

function createName(name: string, selected: boolean): Text {
  const color = selected ? 0x392044 : name === 'empty' ? 0x8d6ba0 : 0xffeaff;
  const label = createText(name, color);
  label.anchor.set(0, 0.5);
  label.position.set(NAME_LEFT + 4, BANK_ROW_HEIGHT / 2);
  return label;
}

function createPreviewGlyph(width: number, selected: boolean): Text {
  const label = createText('▶', selected ? 0x392044 : 0xd889ed);
  label.anchor.set(0, 0.5);
  label.position.set(width - 16, BANK_ROW_HEIGHT / 2);
  return label;
}

function createText(value: string, color: number): Text {
  return new Text({
    text: value,
    style: { fontFamily: 'monogram', fontSize: 13, fontWeight: 'bold', fill: color }, resolution: 3,
  });
}
