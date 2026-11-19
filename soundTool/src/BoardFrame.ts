import { Container, Graphics } from 'pixi.js';

const CORNER_STEP = 4;

/** Stepped cabinet frame with a layered pixel bevel and dark drop edge. */
export class BoardFrame extends Container {
  constructor(width = 512, height = 1024 / 3) {
    super();
    this.addChild(
      drawSteppedFace(width, height, 0, 0x20132b),
      drawSteppedFace(width, height, 1, 0xa45cbd),
      drawSteppedFace(width, height, 3, 0x291537),
      drawSteppedFace(width, height, 4, 0x704083),
      drawSteppedFace(width, height, 6, 0x523064),
      drawSteppedFace(width, height, 8, 0x59316f),
      drawFrameHighlights(width, height),
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

function drawFrameHighlights(width: number, height: number): Graphics {
  return new Graphics()
    .rect(8, 1, width - 16, 1).fill(0xd88ce7)
    .rect(1, 8, 1, height - 16).fill(0xd88ce7)
    .rect(8, height - 2, width - 16, 1).fill(0x2a1738)
    .rect(width - 2, 8, 1, height - 16).fill(0x2a1738)
    .rect(3, 3, 2, 2).fill(0xffc2f4)
    .rect(width - 5, 3, 2, 2).fill(0xffa7e8)
    .rect(3, height - 5, 2, 2).fill(0xcb82e5)
    .rect(width - 5, height - 5, 2, 2).fill(0x291537);
}
