import { Container, Graphics, Text } from 'pixi.js';

export const BANK_ROW_HEIGHT = 16;
const ROW_LEFT = 8;
const ROW_WIDTH = 112;
const NAME_LEFT = 24;
const PLAY_LEFT = 104;

/** A 16px sound-bank slot with its index, sound name, and preview glyph. */
export class SoundBankRow extends Container {
  constructor(index: number, name: string, selected: boolean) {
    super();
    this.addChild(drawRow(selected));
    this.addChild(createIndex(index, selected));
    this.addChild(createName(name, selected));
    this.addChild(createPreviewGlyph(selected));
  }
}

function drawRow(selected: boolean): Graphics {
  const baseColor = selected ? 0xffcf72 : 0x38214c;
  const edgeColor = selected ? 0xf2b954 : 0x251531;
  return new Graphics()
    .rect(ROW_LEFT, 0, ROW_WIDTH, BANK_ROW_HEIGHT)
    .fill(baseColor)
    .rect(ROW_LEFT, 0, 16, BANK_ROW_HEIGHT)
    .fill(edgeColor)
    .rect(NAME_LEFT, 0, 2, BANK_ROW_HEIGHT)
    .fill(0x76508c);
}

function createIndex(index: number, selected: boolean): Text {
  const label = createText(String(index + 1).padStart(2, '0'), selected ? 0x392044 : 0xb88acb);
  label.position.set(ROW_LEFT, 4);
  return label;
}

function createName(name: string, selected: boolean): Text {
  const color = selected ? 0x392044 : name === 'empty' ? 0x8d6ba0 : 0xffeaff;
  const label = createText(name, color);
  label.position.set(NAME_LEFT + 4, 4);
  return label;
}

function createPreviewGlyph(selected: boolean): Text {
  const label = createText('▶', selected ? 0x392044 : 0xd889ed);
  label.position.set(PLAY_LEFT, 4);
  return label;
}

function createText(value: string, color: number): Text {
  return new Text({
    text: value,
    style: { fontFamily: 'monospace', fontSize: 8, fontWeight: 'bold', fill: color },
  });
}
