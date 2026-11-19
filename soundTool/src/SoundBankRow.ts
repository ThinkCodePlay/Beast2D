import { Container, Graphics, Text } from 'pixi.js';

export const BANK_ROW_HEIGHT = 14;
const ROW_LEFT = 8;
const NAME_LEFT = 24;

/** One 16px bank slot, widened to its panel and rendered with list detail. */
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
  return new Graphics()
    .rect(ROW_LEFT, 0, width, BANK_ROW_HEIGHT)
    .fill(baseColor)
    .rect(ROW_LEFT, 0, 16, BANK_ROW_HEIGHT)
    .fill(edgeColor)
    .rect(NAME_LEFT, 0, 2, BANK_ROW_HEIGHT)
    .fill(0x76508c)
    .rect(width - 32, 0, 2, BANK_ROW_HEIGHT)
    .fill(selected ? 0x9a5b3c : 0x76508c);
}

function createIndex(index: number, selected: boolean): Text {
  const label = createText(String(index + 1).padStart(2, '0'), selected ? 0x392044 : 0xb88acb);
  label.position.set(ROW_LEFT, 3);
  return label;
}

function createName(name: string, selected: boolean): Text {
  const color = selected ? 0x392044 : name === 'empty' ? 0x8d6ba0 : 0xffeaff;
  const label = createText(name, color);
  label.position.set(NAME_LEFT + 4, 3);
  return label;
}

function createPreviewGlyph(width: number, selected: boolean): Text {
  const label = createText('▶', selected ? 0x392044 : 0xd889ed);
  label.position.set(width - 16, 3);
  return label;
}

function createText(value: string, color: number): Text {
  return new Text({
    text: value,
    style: { fontFamily: 'monospace', fontSize: 7, fontWeight: 'bold', fill: color },
  });
}
