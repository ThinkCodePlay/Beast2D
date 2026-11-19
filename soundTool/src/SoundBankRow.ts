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
  const baseColor = selected ? 0xffcf72 : 0x38214c;
  const edgeColor = selected ? 0xf2b954 : 0x251531;
  const divider = selected ? 0x9a5b3c : 0x76508c;
  return new Graphics()
    .rect(ROW_LEFT, 0, width, BANK_ROW_HEIGHT).fill(baseColor)
    .rect(ROW_LEFT, 0, 16, BANK_ROW_HEIGHT).fill(edgeColor)
    .rect(ROW_LEFT, 0, width, BANK_ROW_HEIGHT)
    .stroke({ color: selected ? 0xf0c060 : 0x76508c, width: 1 })
    .moveTo(ROW_LEFT + 16, 0).lineTo(ROW_LEFT + 16, BANK_ROW_HEIGHT)
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
