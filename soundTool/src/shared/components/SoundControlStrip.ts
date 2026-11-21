import { Container, Graphics } from 'pixi.js';
import { KnobMarkings, PixelKnob } from '../ui/PixelKnob';
import { drawGradientFace } from '../ui/GradientFace';
import type { ControlMode } from '../controls';
import type { SoundSequence } from '../audio/model';
import { applyDial, dialSnap, dialValue, KNOBS, type DialActions } from '../dials';

/**
 * Bottom strip with the six 32px dials, as wide as the creation panel above
 * it. In '2d' mode the dials are interactive knobs wired to the sequence and
 * player; in '3d' mode only the board markings are drawn and the 3D scene
 * places real rotors on top (see src/3d/three/controlLayout.ts).
 */

// Tiles use the waveform selector's grid: same left edge, pitch and width,
// so every dial column lines up with the waveform button above it.
export const KNOB_GRID_LEFT = 8.3;
export const KNOB_STEP_X = 160 / 3;
export const KNOB_TILE_INSET = 6.5;
export const KNOB_TOP = 9;
export const KNOB_TILE_WIDTH = 45;
const KNOB_TILE_HEIGHT = 44;
const KNOB_TILE_TOP = 1;
const KNOB_SIZE = 32;

export interface SoundControlStripOptions {
  /** Live dial callbacks; in '2d' mode the composition root passes the transport. */
  dials?: DialActions;
  /** '2d' draws interactive dials, '3d' draws markings only. Default '2d'. */
  controls?: ControlMode;
}

export class SoundControlStrip extends Container {
  constructor(width: number, height: number, sequence: SoundSequence, options: SoundControlStripOptions = {}) {
    super();
    const controls = options.controls ?? '2d';
    this.addChild(drawStripFrame(width, height));
    KNOBS.forEach((knob, index) => {
      const tileLeft = KNOB_GRID_LEFT + index * KNOB_STEP_X;
      this.addChild(createKnobTile(tileLeft));
      // In 3D mode the dial caps become rotors; their board markings stay flat.
      if (controls === '3d') {
        const markings = new KnobMarkings(knob.label, knob.color);
        markings.position.set(tileLeft + KNOB_TILE_INSET, KNOB_TOP);
        this.addChild(markings);
      } else {
        const dials = options.dials;
        const control = new PixelKnob(knob.label, dialValue(knob.label, sequence), knob.color,
          dials ? (next) => applyDial(knob.label, next, sequence, dials) : undefined, dialSnap(knob.label));
        control.position.set(tileLeft + (KNOB_TILE_WIDTH - KNOB_SIZE) / 2, KNOB_TOP);
        this.addChild(control);
      }
    });
  }
}

/** Recessed strip: light tiles sit on a navy bed with bright edge lines. */
function drawStripFrame(width: number, height: number): Graphics {
  const frame = new Graphics();
  frame
    .rect(0, 0, width, height).fill(0x170d21)
    .rect(1, 1, width - 2, height - 2).fill(0x442662)
    .rect(1, 1, width - 2, 1.5).fill(0x8a67a3)
    .rect(1, height - 2.5, width - 2, 1.5).fill(0x744992)
    .rect(1, 2.5, 1, height - 5).fill(0x8a67a3)
    .rect(width - 2, 2.5, 1, height - 5).fill(0x8a67a3)
    .rect(1, height - 9, width - 2, 6.5).fill(0x3a1c52);
  return frame;
}

function createKnobTile(left: number): Graphics {
  // The tile holds the whole dial face, tick ring included.
  const tile = new Graphics();
  drawGradientFace(tile, left, KNOB_TILE_TOP, KNOB_TILE_WIDTH, KNOB_TILE_HEIGHT, 3,
    { edge: 0x24152e, top: 0xa580b8, mid: 0x8b68a2, bottom: 0x6d4899 }, 0.78, 1.5);
  return tile;
}
