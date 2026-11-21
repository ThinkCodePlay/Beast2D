import { Container, Graphics, Text } from 'pixi.js';
import { trackDrag } from './Pressable';
import { angleForValue, clampValue, valueTowardPoint } from './knobTurn';

const CONTROL_SIZE = 32;
const CENTER_X = 16;
const CENTER_Y = 12.2;
const TICK_RADIUS_X = 18;
const TICK_RADIUS_Y = 17;
const TICK_LENGTH = 3;
const TICK_CREAM = 0xfff4dc;

/** Sweep start: minimum sits down-left, maximum down-right, dead zone at the bottom. */
const NEEDLE_START_ANGLE = Math.PI * 0.75;

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

/**
 * 32×32 stepped dial with a tick ring and a layered pixel disk. Drag it with
 * mouse or touch and the needle turns to point at the pointer, clamped to the
 * dial's sweep.
 */
export class PixelKnob extends Container {
  private value: number;
  private readonly needle: Graphics;

  constructor(label: string, value: number, color: number, private readonly onChange?: (value: number) => void, private readonly snap: (value: number) => number = clampValue) {
    super();
    this.value = clampValue(value);
    this.addChild(createDialFace(color, label === 'VOL' || label === 'PITCH', label === 'RATE' ? 4 : 6));
    this.needle = new Graphics();
    this.addChild(this.needle);
    this.addChild(createLabel(label));
    this.drawNeedle();
    trackDrag(this, (event) => {
      const point = this.toLocal(event.global);
      this.setValue(valueTowardPoint(CENTER_X, CENTER_Y, point.x, point.y, NEEDLE_START_ANGLE));
    });
  }

  /** The current 0..1 dial value. */
  getValue(): number {
    return this.value;
  }

  /** Point the needle at a 0..1 value. */
  setValue(value: number): void {
    const next = this.snap(clampValue(value));
    if (next === this.value) return;
    this.value = next;
    this.drawNeedle();
    this.onChange?.(next);
  }

  private drawNeedle(): void {
    this.needle.clear();
    drawNeedle(this.needle, CENTER_X, CENTER_Y, this.value, 8, 0x3a2030, 2);
  }
}

function createDialFace(color: number, accented: boolean, intervals: number): Graphics {
  const face = new Graphics();
  drawTickRing(face, accented ? color : TICK_CREAM, intervals);
  drawPixelDisk(face, CENTER_X + 2, CENTER_Y + 3, 14, 0x140b20, 1.08, 0.95);
  drawPixelDisk(face, CENTER_X, CENTER_Y, 14, 0x321b47, 1.08, 0.95);
  drawPixelDisk(face, CENTER_X, CENTER_Y, 12, 0x604077, 1.08, 0.95);
  drawPixelDisk(face, CENTER_X, CENTER_Y, 10, accented ? ACCENT_FACE[color] ?? color : CREAM_FACE, 1.08, 0.95);
  drawPixelDisk(face, CENTER_X - 1, CENTER_Y - 1, 8, CREAM_LIGHT, 1.08, 0.95);
  return face;
}

function drawTickRing(face: Graphics, color: number, intervals: number): void {
  for (let tick = 0; tick <= intervals; tick += 1) {
    const angle = angleForValue(tick / intervals, NEEDLE_START_ANGLE);
    const outerX = CENTER_X + Math.round(Math.cos(angle) * TICK_RADIUS_X);
    const outerY = CENTER_Y + Math.round(Math.sin(angle) * TICK_RADIUS_Y);
    const innerX = CENTER_X + Math.round(Math.cos(angle) * (TICK_RADIUS_X - TICK_LENGTH));
    const innerY = CENTER_Y + Math.round(Math.sin(angle) * (TICK_RADIUS_Y - TICK_LENGTH));
    face
      .moveTo(innerX + 1, innerY + 1).lineTo(outerX + 1, outerY + 1).stroke({ color: 0x291537, width: 3 })
      .moveTo(innerX, innerY).lineTo(outerX, outerY).stroke({ color: 0x3b223d, width: 3 })
      .moveTo(innerX, innerY).lineTo(outerX, outerY).stroke({ color, width: 1 });
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
  const angle = angleForValue(value, NEEDLE_START_ANGLE);
  const endX = centerX + Math.round(Math.cos(angle) * length);
  const endY = centerY + Math.round(Math.sin(angle) * length);
  graphic
    .moveTo(centerX, centerY)
    .lineTo(endX, endY)
    .stroke({ color, width, cap: 'round' });
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
