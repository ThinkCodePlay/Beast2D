import { Container, Graphics, Text } from 'pixi.js';
import { trackDrag } from './Pressable';
import { angleForValue, clampValue, valueTowardPoint } from './knobTurn';

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
const TICK_CREAM = 0xfff4dc;

const TICK_RADIUS_X = 18;
const TICK_RADIUS_Y = 17;
const TICK_LENGTH = 3;

/** Sweep start for the needle; the tick ring keeps the 2D board's orientation. */
const NEEDLE_START_ANGLE = Math.PI * 0.25;
const TICK_START_ANGLE = Math.PI * 0.75;

/** Center of a knob's disk inside its 32×32 tile. */
export const KNOB_CENTER: { x: number; y: number } = { x: CENTER_X, y: CENTER_Y };

/**
 * 32×32 stepped dial: a tick ring, a label, and a layered pixel-disk cap with
 * a value needle. The strip accents VOL and PITCH by tinting their ticks and
 * faces instead of crescents. Drag the dial with mouse or touch and the
 * needle turns to point at the pointer, clamped to the dial's sweep.
 */
export class PixelKnob extends Container {
  constructor(label: string, value: number, color: number) {
    super();
    this.addChild(new KnobMarkings(label, color));
    const cap = new KnobCap(value, color);
    this.addChild(cap);
    trackDrag(this, (event) => {
      const point = this.toLocal(event.global);
      cap.setValue(valueTowardPoint(CENTER_X, CENTER_Y, point.x, point.y, NEEDLE_START_ANGLE));
    });
  }
}

/**
 * The flat board artwork around a dial: tick marks and the label. Stays on
 * the board face when the cap becomes a 3D rotor.
 */
export class KnobMarkings extends Container {
  constructor(label: string, color: number) {
    super();
    const accented = label === 'VOL' || label === 'PITCH';
    this.addChild(drawTickRing(accented ? color : TICK_CREAM));
    this.addChild(createLabel(label, 22.5, 12));
  }
}

/** The rotating part of a dial: layered pixel disks with a value needle. */
export class KnobCap extends Container {
  private value = 0;
  private readonly center: { x: number; y: number };
  private readonly needle: Graphics;

  constructor(value: number, color: number, center = KNOB_CENTER) {
    super();
    this.center = center;
    const cap = new Graphics();
    drawPixelDisk(cap, center.x + 2, center.y + 3, 14, 0x140b20, 1.08, 0.95);
    drawPixelDisk(cap, center.x, center.y, 14, 0x321b47, 1.08, 0.95);
    drawPixelDisk(cap, center.x, center.y, 12, 0x604077, 1.08, 0.95);
    drawPixelDisk(cap, center.x, center.y, 10, color in ACCENT_FACE ? ACCENT_FACE[color] : CREAM_FACE, 1.08, 0.95);
    drawPixelDisk(cap, center.x - 1, center.y - 1, 8, CREAM_LIGHT, 1.08, 0.95);
    this.addChild(cap);
    this.needle = new Graphics();
    this.addChild(this.needle);
    this.setValue(value);
  }

  /** The current 0..1 dial value. */
  getValue(): number {
    return this.value;
  }

  /** Point the needle at a 0..1 value. */
  setValue(value: number): void {
    this.value = clampValue(value);
    this.needle.clear();
    drawNeedle(this.needle, this.center.x, this.center.y, this.value, 8, 0x3a2030, 2);
  }
}

function drawTickRing(color: number): Graphics {
  const ring = new Graphics();
  for (let tick = 0; tick <= 6; tick += 1) {
    const angle = angleForValue(tick / 6, TICK_START_ANGLE);
    const outerX = CENTER_X + Math.round(Math.cos(angle) * TICK_RADIUS_X);
    const outerY = CENTER_Y + Math.round(Math.sin(angle) * TICK_RADIUS_Y);
    const innerX = CENTER_X + Math.round(Math.cos(angle) * (TICK_RADIUS_X - TICK_LENGTH));
    const innerY = CENTER_Y + Math.round(Math.sin(angle) * (TICK_RADIUS_Y - TICK_LENGTH));
    ring
      .moveTo(innerX + 1, innerY + 1).lineTo(outerX + 1, outerY + 1).stroke({ color: 0x291537, width: 3 })
      .moveTo(innerX, innerY).lineTo(outerX, outerY).stroke({ color: 0x3b223d, width: 3 })
      .moveTo(innerX, innerY).lineTo(outerX, outerY).stroke({ color, width: 1 });
  }
  return ring;
}

function drawNeedle(
  face: Graphics,
  centerX: number,
  centerY: number,
  value: number,
  length: number,
  color: number,
  width: number,
): void {
  const angle = angleForValue(value, NEEDLE_START_ANGLE);
  face
    .moveTo(centerX, centerY)
    .lineTo(centerX + Math.cos(angle) * length, centerY + Math.sin(angle) * length)
    .stroke({ width, color, cap: 'round' });
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

function createLabel(text: string, y: number, size: number): Text {
  const label = new Text({
    text,
    style: {
      fontFamily: '"Press Start 2P"',
      fontSize: size,
      fill: 0xfdeed1,
      stroke: { color: 0x2a1235, width: 2, join: 'round' },
    },
  });
  label.anchor.set(0.5, 0);
  label.position.set(16, y);
  return label;
}

// Static tile reference for future dial layouts.
void CONTROL_SIZE;
