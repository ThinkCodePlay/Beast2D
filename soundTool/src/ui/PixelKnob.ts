import { Container, Graphics, Text } from 'pixi.js';

const CONTROL_SIZE = 32;
const STANDARD_CENTER_X = 16;
const STANDARD_CENTER_Y = 12;
const MASTER_CENTER_X = 16;
const MASTER_CENTER_Y = 16;

const PIXEL_DISK = [
  [-4, -10], [4, -10], [4, -8], [7, -8], [7, -6], [9, -6], [9, 6],
  [7, 6], [7, 8], [4, 8], [4, 10], [-4, 10], [-4, 8], [-7, 8],
  [-7, 6], [-9, 6], [-9, -6], [-7, -6], [-7, -8], [-4, -8],
] as const;

type KnobVariant = 'standard' | 'master';

/** 32×32 stepped dial, with a tick-marked master-volume face option. */
export class PixelKnob extends Container {
  constructor(label: string, value: number, color: number, variant: KnobVariant = 'standard') {
    super();
    if (variant === 'master') {
      this.addChild(createMasterFace(value));
      this.addChild(createLabel(label, 26, 12));
      return;
    }
    this.addChild(createStandardFace(color, value, label === 'VOL' || label === 'PITCH'));
    this.addChild(createLabel(label, 24, 14));
  }
}

function createStandardFace(color: number, value: number, accented: boolean): Graphics {
  const face = new Graphics();
  const rim = accented ? (color === 0xff91c8 ? 0xe94f88 : 0x79b94d) : 0x4a2b5c;
  const rimLight = accented ? (color === 0xff91c8 ? 0xffb6d1 : 0xc5f0a6) : 0xfff4dc;
  drawPixelDisk(face, STANDARD_CENTER_X + 2, STANDARD_CENTER_Y + 3, 11, 0x140b20);
  drawPixelDisk(face, STANDARD_CENTER_X, STANDARD_CENTER_Y, 11, 0x321b47);
  drawPixelDisk(face, STANDARD_CENTER_X, STANDARD_CENTER_Y, 10, rim);
  drawPixelDisk(face, STANDARD_CENTER_X, STANDARD_CENTER_Y, 8, 0xeee1d0);
  drawPixelDisk(face, STANDARD_CENTER_X, STANDARD_CENTER_Y, 6, 0xfff4dc);
  face
    .rect(STANDARD_CENTER_X - 5, STANDARD_CENTER_Y - 7, 4, 2).fill(rimLight)
    .rect(STANDARD_CENTER_X - 8, STANDARD_CENTER_Y - 3, 2, 3).fill(rimLight);
  drawNeedle(face, STANDARD_CENTER_X, STANDARD_CENTER_Y, value, 6, 0x482d3b);
  const angle = angleForValue(value);
  const tipX = STANDARD_CENTER_X + Math.round(Math.cos(angle) * 5);
  const tipY = STANDARD_CENTER_Y + Math.round(Math.sin(angle) * 5);
  face.rect(tipX, tipY, 2, 2).fill(accented ? color : 0xffcf72);
  face.rect(STANDARD_CENTER_X - 1, STANDARD_CENTER_Y - 1, 2, 2).fill(0x70428a);
  return face;
}

function createMasterFace(value: number): Graphics {
  const face = new Graphics();
  for (let tick = 0; tick <= 6; tick += 1) {
    const angle = Math.PI * 0.75 + (tick / 6) * Math.PI * 1.5;
    const outerX = MASTER_CENTER_X + Math.round(Math.cos(angle) * 17);
    const outerY = MASTER_CENTER_Y + Math.round(Math.sin(angle) * 17);
    const innerX = MASTER_CENTER_X + Math.round(Math.cos(angle) * 15);
    const innerY = MASTER_CENTER_Y + Math.round(Math.sin(angle) * 15);
    face
      .moveTo(innerX + 1, innerY + 1).lineTo(outerX + 1, outerY + 1).stroke({ color: 0x291537, width: 3 })
      .moveTo(innerX, innerY).lineTo(outerX, outerY).stroke({ color: 0x3b223d, width: 3 })
      .moveTo(innerX, innerY).lineTo(outerX, outerY).stroke({ color: 0xfff4dc, width: 1 });
  }
  drawPixelDisk(face, MASTER_CENTER_X + 2, MASTER_CENTER_Y + 3, 14, 0x140b20);
  drawPixelDisk(face, MASTER_CENTER_X, MASTER_CENTER_Y, 14, 0x321b47);
  drawPixelDisk(face, MASTER_CENTER_X, MASTER_CENTER_Y, 12, 0x604077);
  drawPixelDisk(face, MASTER_CENTER_X, MASTER_CENTER_Y, 10, 0xeee1d0);
  drawPixelDisk(face, MASTER_CENTER_X, MASTER_CENTER_Y, 8, 0xfff4dc);
  drawNeedle(face, MASTER_CENTER_X, MASTER_CENTER_Y, value, 8, 0xa4673f);
  face.rect(MASTER_CENTER_X - 1, MASTER_CENTER_Y - 1, 2, 2).fill(0x70428a);
  return face;
}

function drawPixelDisk(graphic: Graphics, centerX: number, centerY: number, radius: number, color: number): void {
  const points = PIXEL_DISK.flatMap(([x, y]) => [centerX + Math.round(x * radius / 10), centerY + Math.round(y * radius / 10)]);
  graphic.poly(points).fill(color);
}

function drawNeedle(graphic: Graphics, centerX: number, centerY: number, value: number, length: number, color: number): void {
  const angle = angleForValue(value);
  const endX = centerX + Math.round(Math.cos(angle) * length);
  const endY = centerY + Math.round(Math.sin(angle) * length);
  const perpendicularX = Math.round(Math.sin(angle) * 1.5);
  const perpendicularY = Math.round(Math.cos(angle) * 1.5);
  const needle = [
    centerX - perpendicularX, centerY + perpendicularY,
    centerX + perpendicularX, centerY - perpendicularY,
    endX + perpendicularX, endY - perpendicularY,
    endX - perpendicularX, endY + perpendicularY,
  ];
  const shadow = needle.map((point, index) => point + (index % 2 === 0 ? 2 : 3));
  graphic.poly(shadow).fill(0x482d3b).poly(needle).fill(color);
  graphic
    .moveTo(centerX, centerY)
    .lineTo(centerX + Math.round(Math.cos(angle) * Math.max(2, length - 2)), centerY + Math.round(Math.sin(angle) * Math.max(2, length - 2)))
    .stroke({ color: 0xffdfae, width: 1 });
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
