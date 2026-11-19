import { Container, Graphics } from 'pixi.js';
import { EditButton } from './EditButton';
import { PixelKnob } from './ui/PixelKnob';
import { RaisedPanelFrame } from './ui/RaisedPanelFrame';

const KNOBS = [
  { label: 'VOL', value: 0.75, color: 0xff91c8 },
  { label: 'PAN', value: 0.5, color: 0xffcf72 },
  { label: 'DECAY', value: 0.68, color: 0xffcf72 },
  { label: 'RATE', value: 0.58, color: 0xffcf72 },
  { label: 'PITCH', value: 0.62, color: 0x9ee18b },
  { label: 'CUT', value: 0.54, color: 0xffcf72 },
] as const;

const KNOB_PITCH = 48;
const KNOB_TILE_WIDTH = 36;
const KNOB_TILE_HEIGHT = 40;

/** Shared bottom strip with six 32px dials and the waveform edit control. */
export class SoundControlStrip extends Container {
  constructor(width: number, height: number) {
    super();
    this.addChild(new RaisedPanelFrame(width, height));
    KNOBS.forEach((knob, index) => {
      const x = 8 + index * KNOB_PITCH;
      this.addChild(createKnobTile(x));
      const control = new PixelKnob(knob.label, knob.value, knob.color);
      control.position.set(x + 2, 4);
      this.addChild(control);
    });
    const edit = new EditButton();
    edit.position.set(300, 4);
    this.addChild(edit);
  }
}

function createKnobTile(x: number): Graphics {
  return new Graphics()
    .rect(x + 2, 3, KNOB_TILE_WIDTH, KNOB_TILE_HEIGHT).fill(0x20132c)
    .rect(x, 1, KNOB_TILE_WIDTH, KNOB_TILE_HEIGHT - 2).fill(0x724492)
    .rect(x + 2, 3, KNOB_TILE_WIDTH - 4, KNOB_TILE_HEIGHT - 6).fill(0x59316f)
    .rect(x + 4, 2, KNOB_TILE_WIDTH - 8, 1).fill(0xd89de7)
    .rect(x + 1, 4, 1, KNOB_TILE_HEIGHT - 8).fill(0xb77bcf)
    .rect(x + KNOB_TILE_WIDTH - 1, 4, 1, KNOB_TILE_HEIGHT - 8).fill(0x36203f)
    .rect(x + 4, KNOB_TILE_HEIGHT - 1, KNOB_TILE_WIDTH - 6, 1).fill(0x36203f);
}
