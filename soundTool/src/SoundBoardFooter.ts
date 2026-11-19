import { Container, Graphics, Text } from 'pixi.js';

/** Keyboard-help footer, with separate labels and divider artwork. */
export class SoundBoardFooter extends Container {
  constructor(width: number) {
    super();
    this.addChild(drawBackground(width));
    this.addChild(createLabel('SPACE', 32, 0xffcf72));
    this.addChild(createLabel('PLAY / STOP', 96, 0xb88acb));
    this.addChild(createLabel('↑↓', 186, 0xffcf72));
    this.addChild(createLabel('SELECT', 218, 0xb88acb));
    this.addChild(createLabel('DEL', 278, 0xffcf72));
    this.addChild(createLabel('DELETE', 312, 0xb88acb));
    this.addChild(createLabel('TAB', 376, 0xffcf72));
    this.addChild(createLabel('NEXT TAB', 416, 0xb88acb));
  }
}

function drawBackground(width: number): Graphics {
  return new Graphics()
    .rect(0, 0, width, 20).fill(0x281635)
    .rect(0, 0, width, 2).fill(0x9b60b7)
    .rect(0, 18, width, 2).fill(0x1b1027)
    .rect(170, 5, 2, 10).fill(0x70428a)
    .rect(306, 5, 2, 10).fill(0x70428a)
    .rect(426, 5, 2, 10).fill(0x70428a);
}

function createLabel(value: string, x: number, color: number): Text {
  const label = new Text({
    text: value,
    style: { fontFamily: 'monogram', fontSize: 12, fontWeight: 'bold', fill: color }, resolution: 3,
  });
  label.position.set(x, 4);
  return label;
}
