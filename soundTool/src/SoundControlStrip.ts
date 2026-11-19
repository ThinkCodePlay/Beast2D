import { Container, Graphics } from 'pixi.js';
import { EditButton } from './EditButton';
import { PixelKnob } from './ui/PixelKnob';
import { RaisedPanelFrame } from './ui/RaisedPanelFrame';

const KNOBS = [
  { label: 'VOL', value: 0.75, color: 0xff91c8 },
  { label: 'PAN', value: 0.65, color: 0xffcf72 },
  { label: 'DECAY', value: 0.68, color: 0xffcf72 },
  { label: 'RATE', value: 0.58, color: 0xffcf72 },
  { label: 'PITCH', value: 0.62, color: 0x9ee18b },
  { label: 'CUT', value: 0.65, color: 0xffcf72 },
] as const;

const KNOB_PITCH = 48.5;
const KNOB_TILE_WIDTH = 42;
const KNOB_TILE_HEIGHT = 40;

/** Shared bottom strip with six 32px dials and the waveform edit control. */
export class SoundControlStrip extends Container {
  constructor(width: number, height: number) {
    super();
    this.addChild(new RaisedPanelFrame(width, height));
    KNOBS.forEach((knob, index) => {
      const x = 5.5 + index * KNOB_PITCH;
      this.addChild(createKnobTile(x));
      const control = new PixelKnob(knob.label, knob.value, knob.color);
      control.position.set(x + 5, 4);
      this.addChild(control);
    });
    const edit = new EditButton();
    edit.position.set(300, 4);
    this.addChild(edit);
  }
}

function createKnobTile(x: number): Graphics {
  const left = x;
  const top = 1;
  const width = KNOB_TILE_WIDTH;
  const height = KNOB_TILE_HEIGHT - 2;
  return new Graphics()
    .poly([left + 3, top, left + width - 3, top, left + width, top + 3, left + width, top + height - 3,
      left + width - 3, top + height, left + 3, top + height, left, top + height - 3, left, top + 3]).fill(0x24152e)
    .poly([left + 5, top + 2, left + width - 5, top + 2, left + width - 2, top + 5,
      left + width - 2, top + height - 4, left + width - 5, top + height - 2,
      left + 5, top + height - 2, left + 2, top + height - 5, left + 2, top + 5]).fill(0x704584)
    .poly([left + 7, top + 4, left + width - 7, top + 4, left + width - 4, top + 7,
      left + width - 4, top + height - 6, left + width - 7, top + height - 4,
      left + 7, top + height - 4, left + 4, top + height - 7, left + 4, top + 7]).fill(0x59316f)
    .rect(left + 8, top + 4, width - 16, 1).fill(0xb985d2)
    .rect(left + 4, top + 8, 1, height - 16).fill(0x9160aa)
    .rect(left + width - 5, top + 8, 1, height - 16).fill(0x342043)
    .rect(left + 8, top + height - 5, width - 16, 1).fill(0x342043);
}
