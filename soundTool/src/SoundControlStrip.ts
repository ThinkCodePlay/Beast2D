import { Container } from 'pixi.js';
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

/** Shared bottom strip with six 32px dials and the waveform edit control. */
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
    edit.position.set(280, 4);
    this.addChild(edit);
  }
}
