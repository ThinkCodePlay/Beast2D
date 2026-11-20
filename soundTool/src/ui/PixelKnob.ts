import { Container, Graphics, Text } from 'pixi.js';

const CONTROL_SIZE = 32;
const CENTER_X = 16;
const CENTER_Y = 12.2;

const PIXEL_DISK = [
  [-3, -9], [3, -9], [6, -8], [8, -6], [9, -3], [9, 3], [8, 6],
  [6, 8], [3, 9], [-3, 9], [-6, 8], [-8, 6], [-9, 3], [-9, -3],
  [-8, -6], [-6, -8],
] as const;

const ACCENT_FACE: Record<number, number> = {
  0xff91c8: 0xf9749c, // VOL filled pink face (reference strip dial)
  0x9ee18b: 0xd2d76a, // PITCH filled green face (reference strip dial)
};
const CREAM_FACE = 0xfdf0d4;
const CREAM_LIGHT = 0xfff8e8;

/** 32×32 stepped dial with a tick ring and a layered pixel disk. */
export class PixelKnob extends Container {
  constructor(label: string, value: number, color: number) {
    super();
    this.addChild(createDialFace(color, value, label === 'VOL' || label === 'PITCH'));
    this.addChild(createLabel(label));
  }
}

function createDialFace(color: number, value: number, accented: boolean): Graphics {
  const face = new Graphics();
  drawTickRing(face);
  drawPixelDisk(face, CENTER_X + 2, CENTER_Y + 3, 14, 0x140b20, 1.08, 0.95);
  drawPixelDisk(face, CENTER_X, CENTER_Y, 14, 0x321b47, 1.08, 0.95);
  drawPixelDisk(face, CENTER_X, CENTER_Y, 12, 0x604077, 1.08, 0.95);
  drawPixelDisk(face, CENTER_X, CENTER_Y, 10, accented ? ACCENT_FACE[color] ?? color : CREAM_FACE, 1.08, 0.95);
  drawPixelDisk(face, CENTER_X - 1, CENTER_Y - 1, 8, CREAM_LIGHT, 1.08, 0.95);
  drawNeedle(face, CENTER_X, CENTER_Y, value, 8, 0x3a2030, 2);
  return face;
}

function drawTickRing(face: Graphics): void {
  for (let tick = 0; tick <= 6; tick += 1) {
    const angle = Math.PI * 0.75 + (tick / 6) * Math.PI * 1.5;
    const outerX = CENTER_X + Math.round(Math.cos(angle) * 18);
    const outerY = CENTER_Y + Math.round(Math.sin(angle) * 17);
    const innerX = CENTER_X + Math.round(Math.cos(angle) * 15);
    const innerY = CENTER_Y + Math.round(Math.sin(angle) * 15);
    face
      .moveTo(innerX + 1, innerY + 1).lineTo(outerX + 1, outerY + 1).stroke({ color: 0x291537, width: 3 })
      .moveTo(innerX, innerY).lineTo(outerX, outerY).stroke({ color: 0x3b223d, width: 3 })
      .moveTo(innerX, innerY).lineTo(outerX, outerY).stroke({ color: 0xfff4dc, width: 1 });
  }
}

function drawPixelDisk(
  graphic: Graphics,
  centerX: number,
  centerY: number,
  radius: number,
  color: number,
  scaleX = 1,
  scaleY = 1,
): void {
  const points = PIXEL_DISK.flatMap(([x, y]) => [
    centerX + Math.round(x * radius / 10 * scaleX),
    centerY + Math.round(y * radius / 10 * scaleY),
  ]);
  graphic.poly(points).fill(color);
}

function drawNeedle(graphic: Graphics, centerX: number, centerY: number, value: number, length: number, color: number, width = 3): void {
  const angle = angleForValue(value);
  const endX = centerX + Math.round(Math.cos(angle) * length);
  const endY = centerY + Math.round(Math.sin(angle) * length);
  graphic
    .moveTo(centerX, centerY)
    .lineTo(endX, endY)
    .stroke({ color, width, cap: 'round' });
}

function angleForValue(value: number): number {
  return Math.PI * 0.75 + Math.max(0, Math.min(1, value)) * Math.PI * 1.5;
}

function createLabel(value: string): Text {
  const label = new Text({
    text: value,
    style: { fontFamily: 'monogram', fontSize: 12, fontWeight: 'bold', fill: 0xffeaff, stroke: { color: 0x2a1440, width: 1 } }, resolution: 3,
  });
  label.anchor.set(0.5, 0);
  label.position.set(CONTROL_SIZE / 2, 22.5);
  return label;
}
