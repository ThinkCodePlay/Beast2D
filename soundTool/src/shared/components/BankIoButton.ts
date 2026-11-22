import { Container, Graphics } from 'pixi.js';
import { makePressable } from '../ui/Pressable';

/** Button edge length, matching the bank strip's height. */
export const BANK_IO_BUTTON_SIZE = 13;
const GLYPH = 0x281638;

/**
 * The sound bank's small import/export buttons: chunky pixel squares in the
 * scrollbar arrows' style, with a tray glyph. Export is an arrow up out of
 * the tray, import an arrow down into it. Self-contained: the host wires
 * pointertap to the transfer action.
 */
export class BankIoButton extends Container {
  constructor(direction: 'import' | 'export', onTap?: () => void) {
    super();
    this.addChild(drawFace());
    this.addChild(drawGlyph(direction));
    makePressable(this, { pressDepth: 1, onTap });
  }
}

/** The same raised square as the bank's scroll arrows, one pixel smaller. */
function drawFace(): Graphics {
  return new Graphics()
    .rect(1, 1, 12, 12).fill(0x301b42)
    .rect(0, 0, 12, 12).fill(0xc7b3d9)
    .rect(1, 1, 10, 2).fill(0xe8dcf2)
    .rect(1, 1, 2, 10).fill(0xe8dcf2)
    .rect(9, 2, 2, 9).fill(0x8a63a0);
}

/** The tray with its arrow: up and out for export, down and in for import. */
function drawGlyph(direction: 'import' | 'export'): Graphics {
  const glyph = new Graphics();
  // The tray: a flat base with two short walls.
  glyph
    .rect(2, 8, 8, 1).fill(GLYPH)
    .rect(2, 8, 1, 3).fill(GLYPH)
    .rect(9, 8, 1, 3).fill(GLYPH);
  if (direction === 'export') {
    glyph
      .rect(5, 3, 2, 5).fill(GLYPH)
      .poly([6, 1, 9, 5, 3, 5]).fill(GLYPH);
  } else {
    glyph
      .rect(5, 1, 2, 5).fill(GLYPH)
      .poly([3, 4, 9, 4, 6, 8]).fill(GLYPH);
  }
  return glyph;
}
