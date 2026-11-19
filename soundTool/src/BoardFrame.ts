import { Container, Graphics } from 'pixi.js';

/** Raised pixel-art cabinet surrounding the full sound-board display. */
export class BoardFrame extends Container {
  constructor(width = 480, height = 320) {
    super();
    this.addChild(
      createDropShadow(width, height),
      createCabinetSide(width, height),
      createTopFace(width, height),
      createBevel(width, height),
      createCornerPixels(width, height),
    );
  }
}

function createDropShadow(width: number, height: number): Graphics {
  return new Graphics()
    .roundRect(8, 8, width - 8, height - 8, 16)
    .fill(0x140b20);
}

function createCabinetSide(width: number, height: number): Graphics {
  return new Graphics()
    .roundRect(4, 4, width - 8, height - 8, 16)
    .fill(0x2b1739)
    .roundRect(4, 4, width - 8, height - 8, 16)
    .stroke({ color: 0x1b1027, width: 2 });
}

function createTopFace(width: number, height: number): Graphics {
  return new Graphics()
    .roundRect(0, 0, width - 8, height - 8, 16)
    .fill(0x713f87)
    .roundRect(2, 2, width - 12, height - 12, 16)
    .stroke({ color: 0xc276d7, width: 2 })
    .roundRect(6, 6, width - 20, height - 20, 8)
    .fill(0x59316f)
    .roundRect(8, 8, width - 24, height - 24, 8)
    .stroke({ color: 0x9b60b7, width: 2 });
}

function createBevel(width: number, height: number): Graphics {
  return new Graphics()
    .moveTo(24, 8)
    .lineTo(width - 32, 8)
    .stroke({ color: 0xe3a1ef, width: 2 })
    .moveTo(8, 24)
    .lineTo(8, height - 32)
    .stroke({ color: 0xe3a1ef, width: 2 })
    .moveTo(width - 8, 24)
    .lineTo(width - 8, height - 24)
    .stroke({ color: 0x2a1738, width: 2 })
    .moveTo(24, height - 8)
    .lineTo(width - 24, height - 8)
    .stroke({ color: 0x2a1738, width: 2 })
    .moveTo(24, 12)
    .lineTo(width - 32, 12)
    .stroke({ color: 0xa867c3, width: 2, alpha: 0.8 })
    .moveTo(12, 24)
    .lineTo(12, height - 32)
    .stroke({ color: 0xa867c3, width: 2, alpha: 0.8 });
}

function createCornerPixels(width: number, height: number): Graphics {
  return new Graphics()
    .rect(8, 8, 8, 8)
    .fill(0xffc2f4)
    .rect(width - 16, 8, 8, 8)
    .fill(0xffa7e8)
    .rect(8, height - 16, 8, 8)
    .fill(0xcb82e5)
    .rect(width - 16, height - 16, 8, 8)
    .fill(0x291537);
}
