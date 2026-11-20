import { Container, Graphics, Text } from 'pixi.js';

/** Keyboard-help footer, with separate labels and divider artwork. */
export class SoundBoardFooter extends Container {
  constructor(width: number) {
    super();
    this.addChild(drawBackground(width));
    this.addChild(createLabel('SPACE', 56, 0xffcf72));
    this.addChild(createLabel('play / stop', 94, 0xb88acb));
    this.addChild(drawArrows(183));
    this.addChild(createLabel('select', 208, 0xb88acb));
    this.addChild(createLabel('DEL', 273, 0xffcf72));
    this.addChild(createLabel('delete', 299, 0xb88acb));
    this.addChild(createLabel('TAB', 372, 0xffcf72));
    this.addChild(createLabel('next tab', 398, 0xb88acb));
  }
}

const FOOTER_HEIGHT = 18.5;

function drawBackground(width: number): Graphics {
  return new Graphics()
    .rect(0, 0, width, FOOTER_HEIGHT).fill(0x281635)
    .rect(0, 0, width, 2).fill(0x9b60b7)
    .rect(0, FOOTER_HEIGHT - 2, width, 2).fill(0x1b1027)
    .rect(1, 2, 1, FOOTER_HEIGHT - 4).fill(0x70428a)
    .rect(width - 2, 2, 1, FOOTER_HEIGHT - 4).fill(0x70428a)
    .rect(166, 3.5, 1, 11).fill(0x9b60b7)
    .rect(257, 3.5, 1, 11).fill(0x9b60b7)
    .rect(351, 3.5, 1, 11).fill(0x9b60b7)
    .rect(4, 7, 4, 4).fill(0xcb82e5)
    .rect(width - 8, 7, 4, 4).fill(0xff91c8);
}

/** Chunky pixel up/down arrows, matching the reference's filled shapes. */
function drawArrows(x: number): Graphics {
  const arrows = new Graphics();
  const arrow = (cx: number, up: boolean): void => {
    const tipY = up ? 4.5 : 14.5;
    const baseY = up ? 9.5 : 9.5;
    arrows
      .poly([cx - 3, baseY, cx, tipY, cx + 3, baseY]).fill(0xe8b366)
      .rect(cx - 1.5, up ? baseY : baseY - 5, 3, 5).fill(0xe8b366);
  };
  arrow(x, true);
  arrow(x + 11, false);
  return arrows;
}

function createLabel(value: string, x: number, color: number): Text {
  const label = new Text({
    text: value,
    style: { fontFamily: 'monogram', fontSize: 15.5, fontWeight: color === 0xffcf72 ? 'bold' : 'normal', fill: color }, resolution: 3,
  });
  label.position.set(x, 4.5);
  return label;
}
