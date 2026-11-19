import { Container, Graphics } from 'pixi.js';

const CORNER_STEP = 4;
const INNER_INSET = 4;

/** Shared pixel-stepped cabinet edge used by the two separate work panels. */
export class RaisedPanelFrame extends Container {
  constructor(width: number, height: number) {
    super();
    this.addChild(
      createFace(width, height, 4, 4, 0x140b20),
      createFace(width, height, 2, 2, 0x2b1739).stroke({ color: 0x1b1027, width: 2 }),
      createFace(width, height, 0, 0, 0x713f87).stroke({ color: 0xc276d7, width: 2 }),
      createInnerFace(width, height),
      createBevel(width, height),
    );
  }
}

function createFace(width: number, height: number, offset: number, drop: number, color: number): Graphics {
  const faceWidth = width - offset - drop;
  const faceHeight = height - offset - drop;
  return new Graphics()
    .moveTo(offset + CORNER_STEP, offset + drop)
    .lineTo(offset + faceWidth - CORNER_STEP, offset + drop)
    .lineTo(offset + faceWidth, offset + drop + CORNER_STEP)
    .lineTo(offset + faceWidth, offset + faceHeight - CORNER_STEP)
    .lineTo(offset + faceWidth - CORNER_STEP, offset + faceHeight)
    .lineTo(offset + CORNER_STEP, offset + faceHeight)
    .lineTo(offset, offset + faceHeight - CORNER_STEP)
    .lineTo(offset, offset + CORNER_STEP)
    .closePath()
    .fill(color);
}

function createInnerFace(width: number, height: number): Graphics {
  return new Graphics()
    .roundRect(INNER_INSET, INNER_INSET, width - INNER_INSET * 2, height - INNER_INSET * 2, 4)
    .fill(0x59316f)
    .roundRect(INNER_INSET, INNER_INSET, width - INNER_INSET * 2, height - INNER_INSET * 2, 4)
    .stroke({ color: 0x9b60b7, width: 2 });
}

function createBevel(width: number, height: number): Graphics {
  return new Graphics()
    .moveTo(8, 2).lineTo(width - 12, 2).stroke({ color: 0xe3a1ef, width: 2 })
    .moveTo(2, 8).lineTo(2, height - 12).stroke({ color: 0xe3a1ef, width: 2 })
    .moveTo(width - 4, 8).lineTo(width - 4, height - 8).stroke({ color: 0x2a1738, width: 2 })
    .moveTo(8, height - 4).lineTo(width - 8, height - 4).stroke({ color: 0x2a1738, width: 2 })
    .moveTo(8, 4).lineTo(width - 12, 4).stroke({ color: 0xa867c3, width: 2 })
    .moveTo(4, 8).lineTo(4, height - 12).stroke({ color: 0xa867c3, width: 2 })
    .rect(4, 4, 4, 4).fill(0xffc2f4)
    .rect(width - 8, 4, 4, 4).fill(0xffa7e8)
    .rect(4, height - 8, 4, 4).fill(0xcb82e5)
    .rect(width - 8, height - 8, 4, 4).fill(0x291537)
    .moveTo(8, 8).lineTo(width - 8, 8).stroke({ color: 0x70428a, width: 2 });
}
