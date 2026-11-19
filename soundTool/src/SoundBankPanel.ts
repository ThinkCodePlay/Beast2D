import { Container, Graphics, Text } from 'pixi.js';

const PANEL_FACE = 0x59316f;
const TITLE_TEXT = 0xffeaff;
const DIVIDER = 0x70428a;

/** Empty sound-bank panel with the same raised edge as the outer frame. */
export class SoundBankPanel extends Container {
  constructor(width: number, height: number) {
    super();
    this.addChild(createRaisedPanelFrame(width, height));
    this.addChild(createTitle());
  }
}

function createRaisedPanelFrame(width: number, height: number): Graphics {
  return new Graphics()
    .roundRect(3, 4, width - 3, height - 3, 4)
    .fill(0x140b20)
    .roundRect(1, 1, width - 3, height - 3, 4)
    .fill(0x2b1739)
    .roundRect(1, 1, width - 3, height - 3, 4)
    .stroke({ color: 0x1b1027, width: 1 })
    .roundRect(0, 0, width - 4, height - 4, 4)
    .fill(0x713f87)
    .roundRect(1, 1, width - 6, height - 6, 3)
    .stroke({ color: 0xc276d7, width: 1 })
    .roundRect(3, 3, width - 10, height - 10, 2)
    .fill(PANEL_FACE)
    .roundRect(4, 4, width - 12, height - 12, 2)
    .stroke({ color: 0x9b60b7, width: 1 })
    .moveTo(8, 6)
    .lineTo(width - 12, 6)
    .stroke({ color: 0xe3a1ef, width: 1 })
    .moveTo(6, 8)
    .lineTo(6, height - 12)
    .stroke({ color: 0xe3a1ef, width: 1 })
    .moveTo(width - 5, 10)
    .lineTo(width - 5, height - 7)
    .stroke({ color: 0x2a1738, width: 1 })
    .moveTo(10, height - 5)
    .lineTo(width - 7, height - 5)
    .stroke({ color: 0x2a1738, width: 1 })
    .moveTo(1, 19)
    .lineTo(width - 5, 19)
    .stroke({ color: DIVIDER, width: 1 });
}

function createTitle(): Text {
  const label = new Text({
    text: 'SOUND BANK',
    style: {
      fontFamily: 'monospace',
      fontSize: 7,
      fontWeight: 'bold',
      fill: TITLE_TEXT,
    },
  });
  label.position.set(5, 5);
  return label;
}
