import { Container, Graphics } from "pixi.js";
import { makePressable } from "../ui/Pressable";

/** Button edge length, matching the bank strip's height. */
export const BANK_STRIP_BUTTON_SIZE = 13;
const GLYPH = 0x281638;

/**
 * The bank strip's button actions, left to right: whole-bank import/export,
 * undo/redo, single-sound import/export, WAV export.
 */
export type BankStripAction =
  | "undo"
  | "redo"
  | "import"
  | "export"
  | "exportWav"
  | "bankImport"
  | "bankExport";

/**
 * The sound bank's small strip buttons: chunky pixel squares in the
 * scrollbar arrows' style. Single-sound import/export carry a tray glyph,
 * the whole-bank pair a stack of slot rows, and undo a bent back arrow.
 * Self-contained: the host wires pointertap to the action and can grey the
 * button out with setEnabled while the action is unavailable (undo with an
 * empty history).
 */
export class BankStripButton extends Container {
  private enabled = true;

  constructor(action: BankStripAction, onTap?: () => void) {
    super();
    this.addChild(drawFace());
    this.addChild(drawGlyph(action));
    makePressable(this, {
      pressDepth: 1,
      onTap: () => {
        if (this.enabled) onTap?.();
      },
    });
  }

  /** Grey the button out and ignore taps while its action is unavailable. */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.alpha = enabled ? 1 : 0.45;
    this.cursor = enabled ? "pointer" : "default";
  }
}

/** The same raised square as the bank's scroll arrows, one pixel smaller. */
function drawFace(): Graphics {
  return new Graphics()
    .rect(1, 1, 12, 12)
    .fill(0x301b42)
    .rect(0, 0, 12, 12)
    .fill(0xc7b3d9)
    .rect(1, 1, 10, 2)
    .fill(0xe8dcf2)
    .rect(1, 1, 2, 10)
    .fill(0xe8dcf2)
    .rect(9, 2, 2, 9)
    .fill(0x8a63a0);
}

/**
 * The action glyph: a tray with an arrow for single-sound import/export, a
 * stack of slot rows with an arrow for the whole-bank pair, a bent back
 * arrow for undo.
 */
function drawGlyph(action: BankStripAction): Graphics {
  const glyph = new Graphics();
  if (action === "undo" || action === "redo") {
    // Bent arrow: undo points left, redo mirrors it pointing right.
    const left = action === "undo";
    const mirror = (x: number): number => (left ? x : 12 - x);
    return (
      glyph
        .poly(
          left
            ? [2, 5, 6, 2, 6, 8] // Arrowhead pointing left.
            : [10, 5, 6, 2, 6, 8], // Arrowhead pointing right.
        )
        .fill(GLYPH)
        // Shaft running away from the head, then bending down.
        .rect(mirror(6), 4, 4, 2)
        .fill(GLYPH)
        .rect(mirror(9), 4, 1, 5)
        .fill(GLYPH)
    );
  }
  if (action === "exportWav") {
    // A mini waveform with an arrow pointing down: the sound as an audio file.
    return glyph
      .rect(2, 4, 1, 5)
      .fill(GLYPH)
      .rect(4, 2, 1, 9)
      .fill(GLYPH)
      .rect(6, 5, 1, 3)
      .fill(GLYPH)
      .rect(8, 2, 2, 4)
      .fill(GLYPH)
      .poly([7, 6, 11, 6, 9, 9])
      .fill(GLYPH);
  }
  if (action === "bankImport" || action === "bankExport") {
    // The bank: a stack of slot rows, with an arrow leaving or entering it.
    glyph
      .rect(2, 3, 5, 1)
      .fill(GLYPH)
      .rect(2, 5, 5, 1)
      .fill(GLYPH)
      .rect(2, 7, 5, 1)
      .fill(GLYPH);
    if (action === "bankExport") {
      glyph.rect(8, 4, 2, 5).fill(GLYPH).poly([9, 1, 11, 4, 7, 4]).fill(GLYPH);
    } else {
      glyph.rect(8, 2, 2, 5).fill(GLYPH).poly([7, 6, 11, 6, 9, 9]).fill(GLYPH);
    }
    return glyph;
  }
  // The tray: a flat base with two short walls.
  glyph
    .rect(2, 8, 8, 1)
    .fill(GLYPH)
    .rect(2, 8, 1, 3)
    .fill(GLYPH)
    .rect(9, 8, 1, 3)
    .fill(GLYPH);
  if (action === "export") {
    glyph.rect(5, 3, 2, 5).fill(GLYPH).poly([6, 1, 9, 5, 3, 5]).fill(GLYPH);
  } else {
    glyph.rect(5, 1, 2, 5).fill(GLYPH).poly([3, 4, 9, 4, 6, 8]).fill(GLYPH);
  }
  return glyph;
}
