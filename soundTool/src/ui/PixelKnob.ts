import { Container, Graphics, Text } from 'pixi.js';

const KNOB_SIZE = 32;
const KNOB_CENTER_X = 16;
const KNOB_CENTER_Y = 12;

/** Fixed 32×32 dial with a pixel indicator and a short label. */
export class PixelKnob extends Container {
  constructor(label: string, value: number, color: number) {
    super();
    this.addChild(createKnobFace(color, value));
    this.addChild(createLabel(label));
  }
}

function createKnobFace(color: number, value: number): Graphics {
  const valueInRange = Math.max(0, Math.min(1, value));
  const angle = Math.PI * 0.75 + valueInRange * Math.PI * 1.5;
  const indicatorX = KNOB_CENTER_X + Math.round(Math.cos(angle) * 8);
  const indicatorY = KNOB_CENTER_Y + Math.round(Math.sin(angle) * 8);

  return new Graphics()
    .circle(KNOB_CENTER_X + 2, KNOB_CENTER_Y + 3, 12)
    .fill(0x140b20)
    .circle(KNOB_CENTER_X, KNOB_CENTER_Y, 12)
    .fill(0x321b47)
    .circle(KNOB_CENTER_X, KNOB_CENTER_Y, 10)
    .fill(0xeee1d0)
    .circle(KNOB_CENTER_X, KNOB_CENTER_Y, 8)
    .fill(0xfff4dc)
    .moveTo(KNOB_CENTER_X, KNOB_CENTER_Y)
    .lineTo(indicatorX, indicatorY)
    .stroke({ color, width: 2 })
    .rect(KNOB_CENTER_X - 1, KNOB_CENTER_Y - 1, 2, 2)
    .fill(0x70428a);
}

function createLabel(value: string): Text {
  const label = new Text({
    text: value,
    style: {
      fontFamily: 'monospace',
      fontSize: 8,
      fontWeight: 'bold',
      fill: 0xffeaff,
    },
  });
  label.anchor.set(0.5, 0);
  label.position.set(KNOB_SIZE / 2, 24);
  return label;
}
