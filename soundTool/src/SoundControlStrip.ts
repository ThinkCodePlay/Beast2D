import { Container, Graphics } from 'pixi.js';
import { EditButton } from './EditButton';
import { PixelKnob } from './ui/PixelKnob';
import { drawGradientFace } from './ui/GradientFace';

const KNOBS = [
  { label: 'VOL', value: 0.6, color: 0xff91c8 },
  { label: 'PAN', value: 0.63, color: 0xffcf72 },
  { label: 'DECAY', value: 0.72, color: 0xffcf72 },
  { label: 'RATE', value: 0.72, color: 0xffcf72 },
  { label: 'PITCH', value: 0.63, color: 0x9ee18b },
  { label: 'CUT', value: 0.72, color: 0xffcf72 },
] as const;

const KNOB_PITCH = 48.4;
const KNOB_TILE_WIDTH = 40;
const KNOB_TILE_HEIGHT = 42;
const EDIT_GAP = 14;

/** Shared bottom strip with six 32px dials and the waveform edit control. */
export class SoundControlStrip extends Container {
  constructor(width: number, height: number) {
    super();
    this.addChild(drawStripFrame(width, height));
    KNOBS.forEach((knob, index) => {
      const x = 7.5 + index * KNOB_PITCH;
      this.addChild(createKnobTile(x));
      const control = new PixelKnob(knob.label, knob.value, knob.color);
      control.position.set(x + 4, 9);
      this.addChild(control);
    });
    const edit = new EditButton();
    edit.position.set(3.5 + (KNOBS.length - 1) * KNOB_PITCH + KNOB_TILE_WIDTH + EDIT_GAP, 32 / 3);
    this.addChild(edit);
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
