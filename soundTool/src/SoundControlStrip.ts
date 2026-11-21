import { Container, Graphics } from 'pixi.js';
import { PixelKnob } from './ui/PixelKnob';
import { drawGradientFace } from './ui/GradientFace';

import type { SoundSequence } from './audio/model';
import { rateFromDial, rateToDial, snapRateDial } from './audio/rate';

const KNOBS = [
  { label: 'VOL', value: 0.25, color: 0xff91c8 },
  { label: 'RATE', value: 0.5, color: 0xffcf72 },
  { label: 'PAN', value: 0.63, color: 0xffcf72 },
  { label: 'DECAY', value: 0.72, color: 0xffcf72 },
  { label: 'PITCH', value: 0.63, color: 0x9ee18b },
  { label: 'CUT', value: 0.72, color: 0xffcf72 },
] as const;

// Tiles use the waveform selector's grid: same left edge, pitch and width,
// so every dial column lines up with the waveform button above it.
const KNOB_GRID_LEFT = 8.3;
const KNOB_STEP_X = 160 / 3;
const KNOB_TILE_WIDTH = 45;
const KNOB_TILE_HEIGHT = 44;
const KNOB_TILE_TOP = 1;
const KNOB_SIZE = 32;

/** Bottom strip with the six 32px dials, as wide as the creation panel above it. */
export class SoundControlStrip extends Container {
  constructor(width: number, height: number, sequence: SoundSequence, setMasterVolume: (value: number) => void) {
    super();
    this.addChild(drawStripFrame(width, height));
    KNOBS.forEach((knob, index) => {
      const tileLeft = KNOB_GRID_LEFT + index * KNOB_STEP_X;
      this.addChild(createKnobTile(tileLeft));
      const value = knob.label === 'VOL' ? sequence.masterVolume : knob.label === 'RATE' ? rateToDial(sequence.rate) : knob.value;
      const control = new PixelKnob(knob.label, value, knob.color, (next) => {
        if (knob.label === 'VOL') { sequence.masterVolume = next; setMasterVolume(next); }
        if (knob.label === 'RATE') sequence.rate = rateFromDial(next);
      }, knob.label === 'RATE' ? snapRateDial : undefined);
      control.position.set(tileLeft + (KNOB_TILE_WIDTH - KNOB_SIZE) / 2, 9);
      this.addChild(control);
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
  const top = KNOB_TILE_TOP;
  const width = KNOB_TILE_WIDTH;
  const height = KNOB_TILE_HEIGHT;
  const tile = new Graphics();
  drawGradientFace(tile, left, top, width, height, 3,
    { edge: 0x24152e, top: 0xa580b8, mid: 0x8b68a2, bottom: 0x6d4899 }, 0.78, 1.5);
  return tile;
}
