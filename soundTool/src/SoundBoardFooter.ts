import { Container, Graphics, Text } from 'pixi.js';

/** Keyboard help strip. Text groups are separated by eight-pixel rules. */
export class SoundBoardFooter extends Container {
  constructor(width: number) {
    super();
    this.addChild(drawBackground(width));
    this.addChild(createLabel('SPACE  PLAY / STOP', 8, 0xffcf72));
    this.addChild(createLabel('↑↓  SELECT', 160, 0xffcf72));
    this.addChild(createLabel('DEL  DELETE', 256, 0xffcf72));
    this.addChild(createLabel('TAB  NEXT TAB', 352, 0xffcf72));
  }
}

function drawBackground(width: number): Graphics {
  return new Graphics()
    .rect(0, 0, width, 16)
    .fill(0x281635)
    .rect(0, 0, width, 2)
    .fill(0x9b60b7)
    .rect(0, 14, width, 2)
    .fill(0x1b1027)
    .rect(152, 4, 2, 8)
    .fill(0x70428a)
    .rect(248, 4, 2, 8)
    .fill(0x70428a)
    .rect(344, 4, 2, 8)
    .fill(0x70428a);
}

function createLabel(value: string, x: number, accent: number): Text {
  const label = new Text({
    text: value,
    style: { fontFamily: 'monospace', fontSize: 8, fontWeight: 'bold', fill: accent },
  });
  label.position.set(x, 4);
  return label;
}
