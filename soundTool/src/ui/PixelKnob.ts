import { Container, Graphics, Text } from 'pixi.js';

const CONTROL_SIZE = 32;
const STANDARD_CENTER_X = 16;
const STANDARD_CENTER_Y = 10;
const MASTER_CENTER_X = 16;
const MASTER_CENTER_Y = 14;

type KnobVariant = 'standard' | 'master';

/** 32×32 dial, with an enlarged tick-marked master-volume face option. */
export class PixelKnob extends Container {
  constructor(label: string, value: number, color: number, variant: KnobVariant = 'standard') {
    super();
    if (variant === 'master') {
      this.addChild(createMasterFace(color, value));
      this.addChild(createLabel(label, 30));
      return;
    }
    this.addChild(createKnobBase());
    this.addChild(createStandardFace(color, value));
    this.addChild(createLabel(label, 22));
  }
}

function createKnobBase(): Graphics {
  return new Graphics()
    .rect(2, 2, CONTROL_SIZE - 2, CONTROL_SIZE - 2)
    .fill(0x140b20)
    .rect(0, 0, CONTROL_SIZE, CONTROL_SIZE)
    .fill(0x604077)
    .rect(2, 2, CONTROL_SIZE - 8, 2)
    .fill(0xd697e5)
    .rect(2, 2, 2, CONTROL_SIZE - 12)
    .fill(0xb77bcf)
    .rect(CONTROL_SIZE - 2, 4, 2, CONTROL_SIZE - 12)
    .fill(0x36203f)
    .rect(4, CONTROL_SIZE - 2, CONTROL_SIZE - 8, 2)
    .fill(0x36203f);
}

function createStandardFace(color: number, value: number): Graphics {
  const angle = angleForValue(value);
  const indicatorX = STANDARD_CENTER_X + Math.round(Math.cos(angle) * 6);
  const indicatorY = STANDARD_CENTER_Y + Math.round(Math.sin(angle) * 6);
  return new Graphics()
    .circle(STANDARD_CENTER_X + 2, STANDARD_CENTER_Y + 2, 10)
    .fill(0x140b20)
    .circle(STANDARD_CENTER_X, STANDARD_CENTER_Y, 10)
    .fill(0x321b47)
    .circle(STANDARD_CENTER_X, STANDARD_CENTER_Y, 8)
    .fill(0xeee1d0)
    .circle(STANDARD_CENTER_X, STANDARD_CENTER_Y, 6)
    .fill(0xfff4dc)
    .moveTo(STANDARD_CENTER_X, STANDARD_CENTER_Y)
    .lineTo(indicatorX, indicatorY)
    .stroke({ color, width: 2 })
    .rect(STANDARD_CENTER_X - 1, STANDARD_CENTER_Y - 1, 2, 2)
    .fill(0x70428a);
}

function createMasterFace(color: number, value: number): Graphics {
  const angle = angleForValue(value);
  const indicatorX = MASTER_CENTER_X + Math.round(Math.cos(angle) * 7);
  const indicatorY = MASTER_CENTER_Y + Math.round(Math.sin(angle) * 7);
  const dial = new Graphics();

  for (let tick = 0; tick <= 6; tick += 1) {
    const tickAngle = Math.PI * 0.75 + (tick / 6) * Math.PI * 1.5;
    const outerX = MASTER_CENTER_X + Math.round(Math.cos(tickAngle) * 14);
    const outerY = MASTER_CENTER_Y + Math.round(Math.sin(tickAngle) * 14);
    const innerX = MASTER_CENTER_X + Math.round(Math.cos(tickAngle) * 12);
    const innerY = MASTER_CENTER_Y + Math.round(Math.sin(tickAngle) * 12);
    dial.moveTo(innerX, innerY).lineTo(outerX, outerY).stroke({ color: 0xffcf72, width: 2 });
  }

  return dial
    .circle(MASTER_CENTER_X + 2, MASTER_CENTER_Y + 2, 11)
    .fill(0x140b20)
    .circle(MASTER_CENTER_X, MASTER_CENTER_Y, 11)
    .fill(0x321b47)
    .circle(MASTER_CENTER_X, MASTER_CENTER_Y, 9)
    .fill(0xeee1d0)
    .circle(MASTER_CENTER_X, MASTER_CENTER_Y, 7)
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

function createLabel(value: string, y: number): Text {
  const label = new Text({
    text: value,
    style: { fontFamily: 'monospace', fontSize: 8, fontWeight: 'bold', fill: 0xffeaff },
  });
  label.anchor.set(0.5, 0);
  label.position.set(CONTROL_SIZE / 2, y);
  return label;
}
