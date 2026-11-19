import { Container, Graphics } from 'pixi.js';

const CORNER_STEP = 4;

/** Compact stepped cabinet frame with a narrow bevel around the board face. */
export class BoardFrame extends Container {
  constructor(width = 512, height = 1024 / 3) {
    super();
    this.addChild(
      drawSteppedFace(width, height, 0, 0x713f87),
      new Graphics().rect(4, 4, width - 8, height - 8).fill(0x59316f),
      drawBevel(width, height),
      drawCornerPixels(width, height),
    );
  }
}

function drawSteppedFace(width: number, height: number, inset: number, color: number): Graphics {
  const left = inset;
  const right = width - inset;
  const top = inset;
  const bottom = height - inset;
  const step = CORNER_STEP;
  return new Graphics()
    .moveTo(left + step, top)
    .lineTo(right - step, top)
    .lineTo(right - step, top + step)
    .lineTo(right, top + step)
    .lineTo(right, bottom - step)
    .lineTo(right - step, bottom - step)
    .lineTo(right - step, bottom)
    .lineTo(left + step, bottom)
    .lineTo(left + step, bottom - step)
    .lineTo(left, bottom - step)
    .lineTo(left, top + step)
    .lineTo(left + step, top + step)
    .closePath()
    .fill(color);
}

function drawBevel(width: number, height: number): Graphics {
  return new Graphics()
    .moveTo(4, 2).lineTo(width - 6, 2).stroke({ color: 0xe3a1ef, width: 1 })
    .moveTo(2, 4).lineTo(2, height - 6).stroke({ color: 0xe3a1ef, width: 1 })
    .moveTo(width - 2, 4).lineTo(width - 2, height - 4).stroke({ color: 0x2a1738, width: 1 })
    .moveTo(4, height - 2).lineTo(width - 4, height - 2).stroke({ color: 0x2a1738, width: 1 });
}

function drawCornerPixels(width: number, height: number): Graphics {
  return new Graphics()
    .rect(3, 3, 2, 2).fill(0xffc2f4)
    .rect(width - 5, 3, 2, 2).fill(0xffa7e8)
    .rect(3, height - 5, 2, 2).fill(0xcb82e5)
    .rect(width - 5, height - 5, 2, 2).fill(0x291537);
}
