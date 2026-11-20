import { Container, Graphics } from 'pixi.js';

const BAR_COUNT = 32;
const BAR_WIDTH = 8;
const BAR_STEP = 9.5;
const BAR_LEFT = 4;
const BASE_INSET = 2.7;
const BAR_TOP_INSET = 8;
const GOLD = 0xffd251;
const ORANGE = 0xf3864d;
// Reference pickup envelope: tall opening peak, uneven decay, short orange tail.
const REFERENCE_HEIGHTS = [
  48, 52, 45, 40, 34, 37, 39, 35, 32, 34, 29, 26, 25,
  28, 25, 22, 19, 16, 13, 16, 13, 12, 14, 11, 9, 7,
];
// Stretch the reference envelope to the step count, keeping its shape.
const BAR_HEIGHTS = Array.from({ length: BAR_COUNT }, (_, index) => {
  const position = index * (REFERENCE_HEIGHTS.length - 1) / (BAR_COUNT - 1);
  const lower = Math.floor(position);
  const upper = Math.min(lower + 1, REFERENCE_HEIGHTS.length - 1);
  return REFERENCE_HEIGHTS[lower] + (REFERENCE_HEIGHTS[upper] - REFERENCE_HEIGHTS[lower]) * (position - lower);
});

/** Waveform window with grid lines and a decaying gold-to-orange bar profile. */
export class WaveformDisplay extends Container {
  constructor(width: number, height: number) {
    super();
    this.addChild(drawFrame(width, height));
    this.addChild(drawBars(height));
  }
}

function drawFrame(width: number, height: number): Graphics {
  const frame = new Graphics()
    .roundRect(0, 0, width, height, 2).fill(0x21132b)
    .roundRect(1, 1, width - 2, height - 2, 2).fill(0x3f2651);
  for (let x = 12; x < width - 4; x += 27) {
    frame.rect(x, 3, 1, height - 6).fill({ color: 0x76508c, alpha: 0.45 });
  }
  frame
    .roundRect(1, 1, width - 2, 3, 2).fill({ color: 0x59366e, alpha: 0.8 })
    .rect(1, height - 2, width - 2, 1).fill(0x39214c);
  return frame;
}

function drawBars(height: number): Graphics {
  // Scale the reference envelope so its peak fills the window at any height.
  const scale = (height - BAR_TOP_INSET) / Math.max(...BAR_HEIGHTS);
  const bars = new Graphics();
  for (let index = 0; index < BAR_COUNT; index += 1) {
    const x = BAR_LEFT + index * BAR_STEP;
    const barHeight = Math.min(BAR_HEIGHTS[index] * scale, height - BAR_TOP_INSET);
    const t = index / (BAR_COUNT - 1);
    const body = lerpColor(GOLD, ORANGE, t * 0.45);
    const base = lerpColor(GOLD, ORANGE, 0.4 + t * 0.6);
    const baseHeight = Math.max(2, Math.round(barHeight * 0.18));
    const top = height - BASE_INSET - barHeight;
    bars.rect(x, top, BAR_WIDTH, barHeight).fill(body);
    bars.rect(x, height - BASE_INSET - baseHeight, BAR_WIDTH, baseHeight).fill(base);
    bars.rect(x, top, BAR_WIDTH, 1).fill(lerpColor(body, 0xffffff, 0.35));
  }
  return bars;
}

function lerpColor(from: number, to: number, t: number): number {
  const r = Math.round((from >> 16 & 255) + ((to >> 16 & 255) - (from >> 16 & 255)) * t);
  const g = Math.round((from >> 8 & 255) + ((to >> 8 & 255) - (from >> 8 & 255)) * t);
  const b = Math.round((from & 255) + ((to & 255) - (from & 255)) * t);
  return r << 16 | g << 8 | b;
}
