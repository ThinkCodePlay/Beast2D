import { Container, Graphics } from 'pixi.js';
import { makePressable } from '../ui/Pressable';

/** Button edge length, matching the bank strip's height. */
export const BANK_STRIP_BUTTON_SIZE = 13;
const GLYPH = 0x281638;

/** The bank strip's button actions, left to right: undo, import, export. */
export type BankStripAction = 'undo' | 'import' | 'export';

/**
 * The sound bank's small strip buttons: chunky pixel squares in the
 * scrollbar arrows' style. Import/export carry a tray glyph; undo a bent
 * back arrow. Self-contained: the host wires pointertap to the action and
 * can grey the button out with setEnabled while the action is unavailable
 * (undo with an empty history).
 */
export class BankStripButton extends Container {
  private enabled = true;

  constructor(action: BankStripAction, onTap?: () => void) {
    super();
    this.addChild(drawFace());
    this.addChild(drawGlyph(action));
    makePressable(this, { pressDepth: 1, onTap: () => { if (this.enabled) onTap?.(); } });
  }

  /** Grey the button out and ignore taps while its action is unavailable. */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.alpha = enabled ? 1 : 0.45;
    this.cursor = enabled ? 'pointer' : 'default';
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

/** The action glyph: a tray with an arrow for import/export, a bent back arrow for undo. */
function drawGlyph(action: BankStripAction): Graphics {
  const glyph = new Graphics();
  if (action === 'undo') {
    return glyph
      // Arrowhead pointing left.
      .poly([2, 5, 6, 2, 6, 8]).fill(GLYPH)
      // Shaft running right, then bending down.
      .rect(6, 4, 4, 2).fill(GLYPH)
      .rect(9, 4, 1, 5).fill(GLYPH);
  }
  // The tray: a flat base with two short walls.
  glyph
    .rect(2, 8, 8, 1).fill(GLYPH)
    .rect(2, 8, 1, 3).fill(GLYPH)
    .rect(9, 8, 1, 3).fill(GLYPH);
  if (action === 'export') {
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
