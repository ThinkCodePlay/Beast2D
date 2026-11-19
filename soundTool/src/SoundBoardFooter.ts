import { Container, Graphics, Text } from 'pixi.js';

/** Keyboard-help footer, with separate labels and divider artwork. */
export class SoundBoardFooter extends Container {
  constructor(width: number) {
    super();
    this.addChild(drawBackground(width));
    this.addChild(createLabel('SPACE', 56, 0xffcf72));
    this.addChild(createLabel('play / stop', 94, 0xb88acb));
    this.addChild(createLabel('↑↓', 182, 0xffcf72));
    this.addChild(createLabel('select', 208, 0xb88acb));
    this.addChild(createLabel('DEL', 273, 0xffcf72));
    this.addChild(createLabel('delete', 299, 0xb88acb));
    this.addChild(createLabel('TAB', 372, 0xffcf72));
    this.addChild(createLabel('next tab', 398, 0xb88acb));
  }
}

function drawBackground(width: number): Graphics {
  return new Graphics()
    .rect(0, 0, width, 27).fill(0x281635)
    .rect(0, 0, width, 2).fill(0x9b60b7)
    .rect(0, 25, width, 2).fill(0x1b1027)
    .rect(1, 2, 1, 23).fill(0x70428a)
    .rect(width - 2, 2, 1, 23).fill(0x70428a)
    .rect(166, 6, 2, 12).fill(0x70428a)
    .rect(257, 6, 2, 12).fill(0x70428a)
    .rect(351, 6, 2, 12).fill(0x70428a)
    .rect(4, 10, 4, 4).fill(0xcb82e5)
    .rect(width - 8, 10, 4, 4).fill(0xff91c8);
}

function createLabel(value: string, x: number, color: number): Text {
  const label = new Text({
    text: value,
    style: { fontFamily: 'monogram', fontSize: 14, fontWeight: color === 0xffcf72 ? 'bold' : 'normal', fill: color }, resolution: 3,
  });
  label.position.set(x, 3);
  return label;
}
