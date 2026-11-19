import { Container, Graphics, Text } from 'pixi.js';

const CONTROL_SIZE = 32;
const STANDARD_CENTER_X = 16;
const STANDARD_CENTER_Y = 12;
const MASTER_CENTER_X = 16;
const MASTER_CENTER_Y = 16;

type KnobVariant = 'standard' | 'master';

/** 32×32 dial, with an enlarged tick-marked master-volume face option. */
export class PixelKnob extends Container {
  constructor(label: string, value: number, color: number, variant: KnobVariant = 'standard') {
    super();
    if (variant === 'master') {
      this.addChild(createMasterFace(color, value));
      this.addChild(createLabel(label, 26, 12));
      return;
    }
    this.addChild(createStandardFace(color, value, label === 'VOL' || label === 'PITCH'));
    this.addChild(createLabel(label, 24, 14));
  }
}

function createStandardFace(color: number, value: number, accented: boolean): Graphics {
  const angle = angleForValue(value);
  const indicatorX = STANDARD_CENTER_X + Math.round(Math.cos(angle) * 6);
  const indicatorY = STANDARD_CENTER_Y + Math.round(Math.sin(angle) * 6);
  const rim = accented ? (color === 0xff91c8 ? 0xe94f88 : 0x79b94d) : 0x4a2b5c;
  const rimLight = accented ? (color === 0xff91c8 ? 0xffb6d1 : 0xc5f0a6) : 0xfff4dc;
  return new Graphics()
    .circle(STANDARD_CENTER_X + 2, STANDARD_CENTER_Y + 2, 11)
    .fill(0x140b20)
    .circle(STANDARD_CENTER_X, STANDARD_CENTER_Y, 11)
    .fill(0x321b47)
    .circle(STANDARD_CENTER_X, STANDARD_CENTER_Y, 10)
    .fill(rim)
    .circle(STANDARD_CENTER_X, STANDARD_CENTER_Y, 8)
    .fill(0xeee1d0)
    .circle(STANDARD_CENTER_X, STANDARD_CENTER_Y, 6)
    .fill(0xfff4dc)
    .rect(STANDARD_CENTER_X - 7, STANDARD_CENTER_Y - 7, 3, 2)
    .fill(rimLight)
    .rect(STANDARD_CENTER_X - 9, STANDARD_CENTER_Y - 3, 2, 3)
    .fill(rimLight)
    .moveTo(STANDARD_CENTER_X, STANDARD_CENTER_Y)
    .lineTo(indicatorX, indicatorY)
    .stroke({ color: 0x482d3b, width: 4 })
    .moveTo(STANDARD_CENTER_X, STANDARD_CENTER_Y)
    .lineTo(indicatorX, indicatorY)
    .stroke({ color: accented ? color : 0xa4673f, width: 1 })
    .rect(STANDARD_CENTER_X - 1, STANDARD_CENTER_Y - 1, 2, 2)
    .fill(0x70428a);
}

function createMasterFace(color: number, value: number): Graphics {
  const angle = angleForValue(value);
  const indicatorX = MASTER_CENTER_X + Math.round(Math.cos(angle) * 8);
  const indicatorY = MASTER_CENTER_Y + Math.round(Math.sin(angle) * 8);
  const dial = new Graphics();

  for (let tick = 0; tick <= 6; tick += 1) {
    const tickAngle = Math.PI * 0.75 + (tick / 6) * Math.PI * 1.5;
    const outerX = MASTER_CENTER_X + Math.round(Math.cos(tickAngle) * 17);
    const outerY = MASTER_CENTER_Y + Math.round(Math.sin(tickAngle) * 17);
    const innerX = MASTER_CENTER_X + Math.round(Math.cos(tickAngle) * 15);
    const innerY = MASTER_CENTER_Y + Math.round(Math.sin(tickAngle) * 15);
    dial.moveTo(innerX, innerY).lineTo(outerX, outerY).stroke({ color: 0xffcf72, width: 2 });
  }

  return dial
    .circle(MASTER_CENTER_X + 2, MASTER_CENTER_Y + 2, 14)
    .fill(0x140b20)
    .circle(MASTER_CENTER_X, MASTER_CENTER_Y, 14)
    .fill(0x321b47)
    .circle(MASTER_CENTER_X, MASTER_CENTER_Y, 12)
    .fill(0x604077)
    .circle(MASTER_CENTER_X, MASTER_CENTER_Y, 10)
    .fill(0xeee1d0)
    .circle(MASTER_CENTER_X, MASTER_CENTER_Y, 8)
    .fill(0xfff4dc)
    .moveTo(MASTER_CENTER_X, MASTER_CENTER_Y)
    .lineTo(indicatorX, indicatorY)
    .stroke({ color, width: 2 })
    .rect(MASTER_CENTER_X - 1, MASTER_CENTER_Y - 1, 2, 2)
    .fill(0x70428a);
}

function angleForValue(value: number): number {
  return Math.PI * 0.75 + Math.max(0, Math.min(1, value)) * Math.PI * 1.5;
}

function createLabel(value: string, y: number, fontSize: number): Text {
  const label = new Text({
    text: value,
    style: { fontFamily: 'monogram', fontSize, fontWeight: 'bold', fill: 0xffeaff }, resolution: 3,
  });
  label.anchor.set(0.5, 0);
  label.position.set(CONTROL_SIZE / 2, y);
  return label;
}
