import { Container, Graphics } from 'pixi.js';
import type { ControlMode } from './controls';
import { EditButton } from './EditButton';
import { PixelKnob, KnobMarkings } from './ui/PixelKnob';
import { drawGradientFace } from './ui/GradientFace';

export const KNOBS = [
  { label: 'VOL', value: 0.6, color: 0xff91c8 },
  { label: 'PAN', value: 0.63, color: 0xffcf72 },
  { label: 'DECAY', value: 0.72, color: 0xffcf72 },
  { label: 'RATE', value: 0.72, color: 0xffcf72 },
  { label: 'PITCH', value: 0.63, color: 0x9ee18b },
  { label: 'CUT', value: 0.72, color: 0xffcf72 },
] as const;

export const KNOB_PITCH = 48.4;
export const KNOB_FIRST_LEFT = 7.5;
export const KNOB_TILE_INSET = 4;
export const KNOB_TOP = 9;
export const KNOB_TILE_WIDTH = 40;
const KNOB_TILE_HEIGHT = 42;
const EDIT_GAP = 14;

/** Design position of the edit control inside the strip. */
export const EDIT_POSITION = {
  x: 3.5 + (KNOBS.length - 1) * KNOB_PITCH + KNOB_TILE_WIDTH + EDIT_GAP,
  y: 32 / 3,
} as const;

/** Shared bottom strip with six 32px dials and the waveform edit control. */
export class SoundControlStrip extends Container {
  constructor(width: number, height: number, controls: ControlMode = '2d') {
    super();
    this.addChild(drawStripFrame(width, height));
    KNOBS.forEach((knob, index) => {
      const x = KNOB_FIRST_LEFT + index * KNOB_PITCH;
      this.addChild(createKnobTile(x));
      // In 3D mode the dial caps become rotors; their board markings stay flat.
      const control = controls === '2d'
        ? new PixelKnob(knob.label, knob.value, knob.color)
        : new KnobMarkings(knob.label, knob.color);
      control.position.set(x + KNOB_TILE_INSET, KNOB_TOP);
      this.addChild(control);
    });
    if (controls === '2d') {
      const edit = new EditButton();
      edit.position.set(EDIT_POSITION.x, EDIT_POSITION.y);
      this.addChild(edit);
    }
  }
}

const DARK_PANEL_LEFT = 369;

/** Dark recessed strip: light tiles sit on a navy bed with bright edge lines. */
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
  frame
    .rect(DARK_PANEL_LEFT - 1, 3, width - DARK_PANEL_LEFT - 1, height - 6).fill(0x24152e)
    .rect(DARK_PANEL_LEFT, 4, width - DARK_PANEL_LEFT - 3, height - 8).fill(0x3e254f)
    .rect(DARK_PANEL_LEFT, 4, width - DARK_PANEL_LEFT - 3, 1).fill(0x593664)
    .rect(DARK_PANEL_LEFT, 4, 1, height - 8).fill(0x593664);
  return frame;
}

function createKnobTile(x: number): Graphics {
  const left = x;
  const top = 22 / 3;
  const width = KNOB_TILE_WIDTH;
  const height = KNOB_TILE_HEIGHT - 2.5;
  const tile = new Graphics();
  drawGradientFace(tile, left, top, width, height, 3,
    { edge: 0x24152e, top: 0xa580b8, mid: 0x8b68a2, bottom: 0x6d4899 }, 0.78, 1.5);
  return tile;
}
