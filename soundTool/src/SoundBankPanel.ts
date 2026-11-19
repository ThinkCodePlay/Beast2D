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
    .roundRect(4, 4, width - 4, height - 4, 8)
    .fill(0x140b20)
    .roundRect(2, 2, width - 4, height - 4, 8)
    .fill(0x2b1739)
    .roundRect(2, 2, width - 4, height - 4, 8)
    .stroke({ color: 0x1b1027, width: 2 })
    .roundRect(0, 0, width - 4, height - 4, 8)
    .fill(0x713f87)
    .roundRect(2, 2, width - 8, height - 8, 8)
    .stroke({ color: 0xc276d7, width: 2 })
    .roundRect(4, 4, width - 12, height - 12, 4)
    .fill(PANEL_FACE)
    .roundRect(6, 6, width - 16, height - 16, 4)
    .stroke({ color: 0x9b60b7, width: 2 })
    .moveTo(16, 8)
    .lineTo(width - 24, 8)
    .stroke({ color: 0xe3a1ef, width: 2 })
    .moveTo(8, 16)
    .lineTo(8, height - 24)
    .stroke({ color: 0xe3a1ef, width: 2 })
    .moveTo(width - 8, 16)
    .lineTo(width - 8, height - 16)
    .stroke({ color: 0x2a1738, width: 2 })
    .moveTo(16, height - 8)
    .lineTo(width - 16, height - 8)
    .stroke({ color: 0x2a1738, width: 2 })
    .moveTo(16, 12)
    .lineTo(width - 24, 12)
    .stroke({ color: 0xa867c3, width: 2, alpha: 0.8 })
    .moveTo(12, 16)
    .lineTo(12, height - 24)
    .stroke({ color: 0xa867c3, width: 2, alpha: 0.8 })
    .moveTo(2, 24)
    .lineTo(width - 8, 24)
    .stroke({ color: DIVIDER, width: 2 });
}

function createTitle(): Text {
  const label = new Text({
    text: 'SOUND BANK',
    style: {
      fontFamily: 'monospace',
      fontSize: 8,
      fontWeight: 'bold',
      fill: TITLE_TEXT,
    },
  });
  label.position.set(8, 8);
  return label;
}
