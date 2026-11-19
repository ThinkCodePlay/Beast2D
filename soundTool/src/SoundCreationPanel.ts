import { Container, Graphics, Text } from 'pixi.js';

const PANEL_FACE = 0x59316f;
const TITLE_TEXT = 0xffeaff;
const DIVIDER = 0x70428a;

/** Empty sound-creation panel with the pixel-beveled raised outer-frame treatment. */
export class SoundCreationPanel extends Container {
  constructor(width: number, height: number) {
    super();
    this.addChild(...createRaisedPanelFrame(width, height));
    this.addChild(createTitle());
  }
}

function createRaisedPanelFrame(width: number, height: number): Graphics[] {
  const shadow = createChamferedFace(6, 8, width - 8, height - 8, 8, 0x140b20);
  const cabinetSide = createChamferedFace(2, 3, width - 7, height - 7, 8, 0x2b1739)
    .stroke({ color: 0x1b1027, width: 2 });
  const topFace = createChamferedFace(0, 0, width - 6, height - 6, 8, 0x713f87)
    .stroke({ color: 0xc276d7, width: 2 });
  const panelFace = createChamferedFace(4, 4, width - 14, height - 14, 4, PANEL_FACE)
    .stroke({ color: 0x9b60b7, width: 2 });

  const bevel = new Graphics()
    // Bright top and left edges catch the light, like the mockup's raised panels.
    .moveTo(16, 2)
    .lineTo(width - 24, 2)
    .stroke({ color: 0xe3a1ef, width: 2 })
    .moveTo(2, 16)
    .lineTo(2, height - 24)
    .stroke({ color: 0xe3a1ef, width: 2 })
    .moveTo(16, 6)
    .lineTo(width - 24, 6)
    .stroke({ color: 0xa867c3, width: 2, alpha: 0.8 })
    .moveTo(6, 16)
    .lineTo(6, height - 24)
    .stroke({ color: 0xa867c3, width: 2, alpha: 0.8 })
    // Dark edges and the offset shadow sit on the lower-right side.
    .moveTo(width - 8, 16)
    .lineTo(width - 8, height - 16)
    .stroke({ color: 0x2a1738, width: 2 })
    .moveTo(16, height - 8)
    .lineTo(width - 16, height - 8)
    .stroke({ color: 0x2a1738, width: 2 })
    // A pixel-stepped inner title rule keeps the heading separated from the blank panel.
    .moveTo(8, 24)
    .lineTo(width - 16, 24)
    .stroke({ color: DIVIDER, width: 2 });

  return [shadow, cabinetSide, topFace, panelFace, bevel];
}

function createChamferedFace(
  x: number,
  y: number,
  width: number,
  height: number,
  corner: number,
  color: number,
): Graphics {
  return new Graphics()
    .moveTo(x + corner, y)
    .lineTo(x + width - corner, y)
    .lineTo(x + width - corner / 2, y + corner / 2)
    .lineTo(x + width, y + corner)
    .lineTo(x + width, y + height - corner)
    .lineTo(x + width - corner / 2, y + height - corner / 2)
    .lineTo(x + width - corner, y + height)
    .lineTo(x + corner, y + height)
    .lineTo(x + corner / 2, y + height - corner / 2)
    .lineTo(x, y + height - corner)
    .lineTo(x, y + corner)
    .lineTo(x + corner / 2, y + corner / 2)
    .closePath()
    .fill(color);
}

function createTitle(): Text {
  const label = new Text({
    text: 'SOUND CREATION',
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
