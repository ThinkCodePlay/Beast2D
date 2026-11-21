import { Container, Graphics } from 'pixi.js';
import { PixelKnob } from './ui/PixelKnob';
import { drawGradientFace } from './ui/GradientFace';

import type { SoundSequence } from './audio/model';
import { rateFromDial, rateToDial, snapRateDial } from './audio/rate';
import { pitchFromDial, pitchToDial, snapPanDial, snapPitchDial } from './audio/effects';

const KNOBS = [
  { label: 'VOL', color: 0xff91c8 },
  { label: 'RATE', color: 0xffcf72 },
  { label: 'PAN', color: 0xffcf72 },
  { label: 'DECAY', color: 0xffcf72 },
  { label: 'PITCH', color: 0x9ee18b },
  { label: 'CUT', color: 0xffcf72 },
] as const;
type KnobLabel = typeof KNOBS[number]['label'];

/** Live dial callbacks the composition root routes to the player. */
export interface DialActions {
  setMasterVolume(value: number): void;
  setPan(value: number): void;
  setCutoff(value: number): void;
}

/** A dial's resting position always reflects the sequence it edits. */
function dialValue(label: KnobLabel, sequence: SoundSequence): number {
  switch (label) {
    case 'VOL': return sequence.masterVolume;
    case 'RATE': return rateToDial(sequence.rate);
    case 'PAN': return sequence.pan;
    case 'DECAY': return sequence.decay;
    case 'PITCH': return pitchToDial(sequence.pitch);
    case 'CUT': return sequence.cut;
  }
}

/** Stepped dials snap so their neutral and marked detents are exact. */
function dialSnap(label: KnobLabel): ((value: number) => number) | undefined {
  if (label === 'RATE') return snapRateDial;
  if (label === 'PAN') return snapPanDial;
  if (label === 'PITCH') return snapPitchDial;
  return undefined;
}

/** Write the turn into the sequence; live dials also reach the player. */
function applyDial(label: KnobLabel, value: number, sequence: SoundSequence, dials: DialActions): void {
  switch (label) {
    case 'VOL': sequence.masterVolume = value; dials.setMasterVolume(value); break;
    case 'RATE': sequence.rate = rateFromDial(value); break;
    case 'PAN': sequence.pan = value; dials.setPan(value); break;
    case 'DECAY': sequence.decay = value; break;
    case 'PITCH': sequence.pitch = pitchFromDial(value); break;
    case 'CUT': sequence.cut = value; dials.setCutoff(value); break;
  }
}

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
  constructor(width: number, height: number, sequence: SoundSequence, dials: DialActions) {
    super();
    this.addChild(drawStripFrame(width, height));
    KNOBS.forEach((knob, index) => {
      const tileLeft = KNOB_GRID_LEFT + index * KNOB_STEP_X;
      this.addChild(createKnobTile(tileLeft));
      const control = new PixelKnob(knob.label, dialValue(knob.label, sequence), knob.color,
        (next) => applyDial(knob.label, next, sequence, dials), dialSnap(knob.label));
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
