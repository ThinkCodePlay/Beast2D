import { Container, Graphics, Text } from 'pixi.js';

/** Keyboard-help footer, with separate labels and divider artwork. */
export class SoundBoardFooter extends Container {
  constructor(width: number) {
    super();
    this.addChild(drawBackground(width));
    this.addChild(createLabel('SPACE', 48, 0xffcf72));
    this.addChild(createLabel('PLAY / STOP', 112, 0xb88acb));
    this.addChild(createLabel('↑↓', 192, 0xffcf72));
    this.addChild(createLabel('SELECT', 224, 0xb88acb));
    this.addChild(createLabel('DEL', 288, 0xffcf72));
    this.addChild(createLabel('DELETE', 328, 0xb88acb));
    this.addChild(createLabel('TAB', 384, 0xffcf72));
    this.addChild(createLabel('NEXT TAB', 424, 0xb88acb));
  }
}

function drawBackground(width: number): Graphics {
  return new Graphics()
    .rect(0, 0, width, 16).fill(0x281635)
    .rect(0, 0, width, 2).fill(0x9b60b7)
    .rect(0, 14, width, 2).fill(0x1b1027)
    .rect(176, 4, 2, 8).fill(0x70428a)
    .rect(272, 4, 2, 8).fill(0x70428a)
    .rect(360, 4, 2, 8).fill(0x70428a);
}

function createLabel(value: string, x: number, color: number): Text {
  const label = new Text({
    text: value,
    style: { fontFamily: 'monogram', fontSize: 12, fontWeight: 'bold', fill: color }, resolution: 3,
  });
  label.position.set(x, 4);
  return label;
}
