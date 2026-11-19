import { Container, Graphics } from 'pixi.js';
import { EditButton } from './EditButton';
import { PixelKnob } from './ui/PixelKnob';
import { RaisedPanelFrame } from './ui/RaisedPanelFrame';

const KNOBS = [
  { label: 'VOL', value: 0.75, color: 0xff91c8 },
  { label: 'PAN', value: 0.5, color: 0xffcf72 },
  { label: 'DEC', value: 0.68, color: 0xffcf72 },
  { label: 'RATE', value: 0.58, color: 0xffcf72 },
  { label: 'PITCH', value: 0.62, color: 0x9ee18b },
  { label: 'CUT', value: 0.54, color: 0xffcf72 },
] as const;

/** Shared bottom strip with six dials, a combined Edit button, and bank bay. */
export class SoundControlStrip extends Container {
  constructor(width: number, height: number) {
    super();
    this.addChild(new RaisedPanelFrame(width, height));
    KNOBS.forEach((knob, index) => {
      const control = new PixelKnob(knob.label, knob.value, knob.color);
      control.position.set(16 + index * 40, 0);
      this.addChild(control);
    });
    const edit = new EditButton();
    edit.position.set(280, 0);
    this.addChild(edit);
    this.addChild(createEmptyBankBay(width));
  }
}

function createEmptyBankBay(width: number): Graphics {
  return new Graphics()
    .rect(352, 4, width - 368, 24).fill(0x39214c)
    .rect(356, 8, width - 376, 16).stroke({ color: 0x70428a, width: 2 });
}
