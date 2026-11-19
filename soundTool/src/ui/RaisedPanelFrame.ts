import { Container, Graphics } from 'pixi.js';

/** Shared pixel-stepped cabinet edge used by the two separate work panels. */
export class RaisedPanelFrame extends Container {
  constructor(width: number, height: number) {
    super();
    this.addChild(
      createFace(width, height, 8, 8, 0x140b20),
      createFace(width, height, 4, 4, 0x2b1739).stroke({ color: 0x1b1027, width: 2 }),
      createFace(width, height, 0, 0, 0x713f87).stroke({ color: 0xc276d7, width: 2 }),
      createInnerFace(width, height),
      createBevel(width, height),
    );
  }
}

function createFace(width: number, height: number, offset: number, drop: number, color: number): Graphics {
  const faceWidth = width - offset - drop;
  const faceHeight = height - offset - drop;
  const corner = 8;
  return new Graphics()
    .moveTo(offset + corner, offset + drop)
    .lineTo(offset + faceWidth - corner, offset + drop)
    .lineTo(offset + faceWidth, offset + drop + corner)
    .lineTo(offset + faceWidth, offset + faceHeight - corner)
    .lineTo(offset + faceWidth - corner, offset + faceHeight)
    .lineTo(offset + corner, offset + faceHeight)
    .lineTo(offset, offset + faceHeight - corner)
    .lineTo(offset, offset + corner)
    .closePath()
    .fill(color);
}

function createInnerFace(width: number, height: number): Graphics {
  return new Graphics()
    .roundRect(8, 8, width - 16, height - 16, 4)
    .fill(0x59316f)
    .roundRect(8, 8, width - 16, height - 16, 4)
    .stroke({ color: 0x9b60b7, width: 2 });
}

function createBevel(width: number, height: number): Graphics {
  return new Graphics()
    .moveTo(16, 4)
    .lineTo(width - 24, 4)
    .stroke({ color: 0xe3a1ef, width: 2 })
    .moveTo(4, 16)
    .lineTo(4, height - 24)
    .stroke({ color: 0xe3a1ef, width: 2 })
    .moveTo(16, 8)
    .lineTo(width - 24, 8)
    .stroke({ color: 0xa867c3, width: 2 })
    .moveTo(8, 16)
    .lineTo(8, height - 24)
    .stroke({ color: 0xa867c3, width: 2 })
    .moveTo(width - 8, 16)
    .lineTo(width - 8, height - 16)
    .stroke({ color: 0x2a1738, width: 2 })
    .moveTo(16, height - 8)
    .lineTo(width - 16, height - 8)
    .stroke({ color: 0x2a1738, width: 2 })
    .rect(8, 8, 4, 4)
    .fill(0xffc2f4)
    .rect(width - 16, 8, 4, 4)
    .fill(0xffa7e8)
    .rect(8, height - 16, 4, 4)
    .fill(0xcb82e5)
    .moveTo(16, 16)
    .lineTo(width - 16, 16)
    .stroke({ color: 0x70428a, width: 2 });
}
