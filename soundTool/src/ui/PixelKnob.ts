import { Container, Graphics, Text } from 'pixi.js';

const CONTROL_SIZE = 32;
const STANDARD_CENTER_X = 16;
const STANDARD_CENTER_Y = 12.2;
const MASTER_CENTER_X = 16;
const MASTER_CENTER_Y = 16;

const PIXEL_DISK = [
  [-3, -9], [3, -9], [6, -8], [8, -6], [9, -3], [9, 3], [8, 6],
  [6, 8], [3, 9], [-3, 9], [-6, 8], [-8, 6], [-9, 3], [-9, -3],
  [-8, -6], [-6, -8],
] as const;

const CRESCENT_COLORS: Record<number, number> = {
  0xff91c8: 0xf9749c, // VOL filled pink face (reference strip dial)
  0x9ee18b: 0xd2d76a, // PITCH filled green face (reference strip dial)
};
const CREAM_FACE = 0xfdf0d4;
const CREAM_LIGHT = 0xfff8e8;

export type KnobVariant = 'standard' | 'master';

/** Center of a knob's disk inside its 32×32 tile, per variant. */
export function knobCenter(variant: KnobVariant): { x: number; y: number } {
  return variant === 'master'
    ? { x: MASTER_CENTER_X, y: MASTER_CENTER_Y }
    : { x: STANDARD_CENTER_X, y: STANDARD_CENTER_Y };
}

/** 32×32 stepped dial, with a tick-marked master-volume face option. */
export class PixelKnob extends Container {
  constructor(label: string, value: number, color: number, variant: KnobVariant = 'standard') {
    super();
    this.addChild(new KnobMarkings(label, color, variant));
    this.addChild(new KnobCap(value, color, variant, knobCenter(variant)));
  }
}

/**
 * The flat board artwork around a dial: tick marks, accent pixels and the
 * label. Stays on the board face when the cap becomes a 3D rotor.
 */
export class KnobMarkings extends Container {
  constructor(label: string, color: number, variant: KnobVariant = 'standard') {
    super();
    const accented = variant === 'standard' && (label === 'VOL' || label === 'PITCH');
    if (variant === 'master') {
      this.addChild(drawMasterTicks());
      this.addChild(createLabel(label, 26, 11));
      return;
    }
    this.addChild(drawTickDots(accented ? color : 0xd8c8e8));
    if (accented) this.addChild(drawAccentPixels(color));
    this.addChild(createLabel(label, 22.5, 12));
  }
}

/** The rotating part of a dial: layered pixel disks with a value needle. */
export class KnobCap extends Container {
  constructor(value: number, color: number, variant: KnobVariant = 'standard', center = knobCenter(variant)) {
    super();
    const accented = variant === 'standard' && (color in CRESCENT_COLORS);
    const cap = new Graphics();
    if (variant === 'master') {
      drawPixelDisk(cap, center.x + 2, center.y + 3, 14, 0x140b20);
      drawPixelDisk(cap, center.x, center.y, 14, 0x321b47);
      drawPixelDisk(cap, center.x, center.y, 12, 0x604077);
      drawPixelDisk(cap, center.x, center.y, 10, CREAM_FACE);
      drawPixelDisk(cap, center.x - 1, center.y - 1, 8, CREAM_LIGHT);
      drawNeedle(cap, center.x, center.y, value, 8, 0x3a2030, 2);
    } else {
      drawPixelDisk(cap, center.x + 1.4, center.y + 2, 14, 0x140b20, 1.08, 0.95);
      drawPixelDisk(cap, center.x, center.y, 13.7, 0x321b47, 1.08, 0.95);
      // Accented strip dials have a fully colored face in the reference; the rest are cream.
      drawPixelDisk(cap, center.x, center.y, 12.4, accented ? CRESCENT_COLORS[color] : CREAM_FACE, 1.08, 0.95);
      drawPixelDisk(cap, center.x - 2, center.y - 2.5, 8.2, CREAM_LIGHT, 1.08, 0.95);
      drawNeedle(cap, center.x, center.y, value, 6.5, 0x3a2030, 2.5);
      cap.rect(center.x - 1, center.y - 1, 2, 2).fill(0x3a2030);
    }
    this.addChild(cap);
  }
}

function drawTickDots(color: number): Graphics {
  const face = new Graphics();
  for (let tick = 0; tick < 7; tick += 1) {
    const angle = Math.PI * (0.75 + tick * 0.25);
    const x = STANDARD_CENTER_X + Math.round(Math.cos(angle) * 18);
    const y = STANDARD_CENTER_Y + Math.round(Math.sin(angle) * 16.5);
    face.rect(x, y, 1.5, 1.5).fill(color);
  }
  return face;
}

function drawAccentPixels(color: number): Graphics {
  const face = new Graphics();
  const centerX = STANDARD_CENTER_X;
  const centerY = STANDARD_CENTER_Y;
  [
    [centerX - 14, centerY - 4],
    [centerX - 15, centerY + 2],
    [centerX - 13, centerY + 7],
    [centerX - 9, centerY + 11],
    [centerX + 11, centerY + 10],
    [centerX + 14, centerY + 5],
  ].forEach(([x, y]) => face.rect(x, y, 1, 1).fill(color));
  return face;
}

function drawMasterTicks(): Graphics {
  const face = new Graphics();
  for (let tick = 0; tick <= 6; tick += 1) {
    const angle = Math.PI * 0.75 + (tick / 6) * Math.PI * 1.5;
    const outerX = MASTER_CENTER_X + Math.round(Math.cos(angle) * 18);
    const outerY = MASTER_CENTER_Y + Math.round(Math.sin(angle) * 17);
    const innerX = MASTER_CENTER_X + Math.round(Math.cos(angle) * 15);
    const innerY = MASTER_CENTER_Y + Math.round(Math.sin(angle) * 15);
    face
      .moveTo(innerX + 1, innerY + 1).lineTo(outerX + 1, outerY + 1).stroke({ color: 0x291537, width: 3 })
      .moveTo(innerX, innerY).lineTo(outerX, outerY).stroke({ color: 0x3b223d, width: 3 })
      .moveTo(innerX, innerY).lineTo(outerX, outerY).stroke({ color: 0xfff4dc, width: 1 });
  }
  return face;
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

function createLabel(value: string, y: number, fontSize: number): Text {
  const label = new Text({
    text: value,
    style: { fontFamily: 'monogram', fontSize, fontWeight: 'bold', fill: 0xffeaff, stroke: { color: 0x2a1440, width: 1 } }, resolution: 3,
  });
  label.anchor.set(0.5, 0);
  label.position.set(CONTROL_SIZE / 2, y);
  return label;
}
