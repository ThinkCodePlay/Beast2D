import { Container, Graphics } from 'pixi.js';

const CORNER_STEP = 8;

/** Stepped pixel-art cabinet with a layered bevel and offset shadow. */
export class BoardFrame extends Container {
  constructor(width = 512, height = 1024 / 3) {
    super();
    this.addChild(
      drawSteppedFace(width, height, 8, 8, 0x140b20),
      drawSteppedFace(width, height, 4, 4, 0x2b1739).stroke({ color: 0x1b1027, width: 2 }),
      drawSteppedFace(width, height, 0, 0, 0x713f87).stroke({ color: 0xc276d7, width: 2 }),
      drawInnerFace(width, height),
      drawBevel(width, height),
      drawCornerPixels(width, height),
    );
  }
}

function drawSteppedFace(width: number, height: number, inset: number, depth: number, color: number): Graphics {
  const left = inset;
  const right = width - inset - depth;
  const top = inset + depth;
  const bottom = height - inset;
  const step = CORNER_STEP;
  return new Graphics()
    .moveTo(left + step, top)
    .lineTo(right - step, top)
    .lineTo(right - step, top + 4)
    .lineTo(right - 4, top + 4)
    .lineTo(right - 4, top + step)
    .lineTo(right, top + step)
    .lineTo(right, bottom - step)
    .lineTo(right - 4, bottom - step)
    .lineTo(right - 4, bottom - 4)
    .lineTo(right - step, bottom - 4)
    .lineTo(right - step, bottom)
    .lineTo(left + step, bottom)
    .lineTo(left + step, bottom - 4)
    .lineTo(left + 4, bottom - 4)
    .lineTo(left + 4, bottom - step)
    .lineTo(left, bottom - step)
    .lineTo(left, top + step)
    .lineTo(left + 4, top + step)
    .lineTo(left + 4, top + 4)
    .lineTo(left + step, top + 4)
    .closePath()
    .fill(color);
}

function drawInnerFace(width: number, height: number): Graphics {
  return drawSteppedFace(width, height, 8, 8, 0x59316f)
    .stroke({ color: 0x9b60b7, width: 2 });
}

function drawBevel(width: number, height: number): Graphics {
  return new Graphics()
    .moveTo(24, 8).lineTo(width - 32, 8).stroke({ color: 0xe3a1ef, width: 2 })
    .moveTo(8, 24).lineTo(8, height - 32).stroke({ color: 0xe3a1ef, width: 2 })
    .moveTo(width - 8, 24).lineTo(width - 8, height - 24).stroke({ color: 0x2a1738, width: 2 })
    .moveTo(24, height - 8).lineTo(width - 24, height - 8).stroke({ color: 0x2a1738, width: 2 })
    .moveTo(24, 12).lineTo(width - 32, 12).stroke({ color: 0xa867c3, width: 2, alpha: 0.8 })
    .moveTo(12, 24).lineTo(12, height - 32).stroke({ color: 0xa867c3, width: 2, alpha: 0.8 });
}

function drawCornerPixels(width: number, height: number): Graphics {
  return new Graphics()
    .rect(8, 8, 8, 8).fill(0xffc2f4)
    .rect(width - 16, 8, 8, 8).fill(0xffa7e8)
    .rect(8, height - 16, 8, 8).fill(0xcb82e5)
    .rect(width - 16, height - 16, 8, 8).fill(0x291537);
}
