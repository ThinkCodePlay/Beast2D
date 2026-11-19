import { Container, Graphics, Text } from 'pixi.js';

const PANEL_DEEP = 0x29173a;
const PANEL_BORDER = 0xb875d0;
const TITLE_TEXT = 0xffeaff;
const DIVIDER = 0x70428a;

/** Empty sound-bank panel frame, ready for the bank list in a later step. */
export class SoundBankPanel extends Container {
  constructor(width: number, height: number) {
    super();
    this.addChild(createPanelFrame(width, height));
    this.addChild(createTitle());
  }
}

function createPanelFrame(width: number, height: number): Graphics {
  return new Graphics()
    .roundRect(0, 0, width, height, 4)
    .fill(PANEL_DEEP)
    .roundRect(0.5, 0.5, width - 1, height - 1, 4)
    .stroke({ color: PANEL_BORDER, width: 1 })
    .moveTo(1, 19)
    .lineTo(width - 1, 19)
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
