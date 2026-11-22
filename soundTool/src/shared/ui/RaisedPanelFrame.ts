import { Container, Graphics } from "pixi.js";

const CORNER_STEP = 2;
const PANEL_INSET = 3;

/** Thin stepped panel inset with restrained top-left light and lower-right shade. */
export class RaisedPanelFrame extends Container {
  constructor(width: number, height: number, panelColor = 0x59316f) {
    super();
    this.addChild(
      drawSteppedFace(width, height, 0, 0x4a2c5e).stroke({
        color: 0x9b60b7,
        width: 1,
      }),
      drawSteppedFace(width, height, PANEL_INSET, panelColor).stroke({
        color: 0x342043,
        width: 1,
      }),
      drawBevel(width, height),
    );
  }
}

function drawSteppedFace(
  width: number,
  height: number,
  inset: number,
  color: number,
): Graphics {
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
    .moveTo(4, 1)
    .lineTo(width - 6, 1)
    .stroke({ color: 0xd89de7, width: 1 })
    .moveTo(1, 4)
    .lineTo(1, height - 6)
    .stroke({ color: 0xd89de7, width: 1 })
    .moveTo(width - 1, 4)
    .lineTo(width - 1, height - 4)
    .stroke({ color: 0x342043, width: 1 })
    .moveTo(4, height - 1)
    .lineTo(width - 4, height - 1)
    .stroke({ color: 0x342043, width: 1 });
}
