import { Container, Graphics } from 'pixi.js';

const DISPLAY_HEIGHT = 59.3;
const BAR_COUNT = 26;
const BAR_WIDTH = 10;
const BAR_STEP = 35 / 3;
const BAR_LEFT = 4;
const BASE_INSET = 2.7;
const GOLD = 0xffd251;
const ORANGE = 0xf3864d;
// Reference pickup envelope: tall opening peak, uneven decay, short orange tail.
const BAR_HEIGHTS = [
  48, 52, 45, 40, 34, 37, 39, 35, 32, 34, 29, 26, 25,
  28, 25, 22, 19, 16, 13, 16, 13, 12, 14, 11, 9, 7,
];

/** Waveform window with grid lines and a decaying gold-to-orange bar profile. */
export class WaveformDisplay extends Container {
  constructor(width: number) {
    super();
    this.addChild(drawFrame(width));
    this.addChild(drawBars());
  }
}

function drawFrame(width: number): Graphics {
  const frame = new Graphics()
    .roundRect(0, 0, width, DISPLAY_HEIGHT, 2).fill(0x21132b)
    .roundRect(1, 1, width - 2, DISPLAY_HEIGHT - 2, 2).fill(0x3f2651);
  for (let x = 12; x < width - 4; x += 27) {
    frame.rect(x, 3, 1, DISPLAY_HEIGHT - 6).fill({ color: 0x76508c, alpha: 0.45 });
  }
  frame
    .roundRect(1, 1, width - 2, 3, 2).fill({ color: 0x59366e, alpha: 0.8 })
    .rect(1, DISPLAY_HEIGHT - 2, width - 2, 1).fill(0x39214c);
  return frame;
}

function drawBars(): Graphics {
  const bars = new Graphics();
  for (let index = 0; index < BAR_COUNT; index += 1) {
    const x = BAR_LEFT + index * BAR_STEP;
    const height = Math.min(BAR_HEIGHTS[index], DISPLAY_HEIGHT - 8);
    const t = index / (BAR_COUNT - 1);
    const body = lerpColor(GOLD, ORANGE, t * 0.45);
    const base = lerpColor(GOLD, ORANGE, 0.4 + t * 0.6);
    const baseHeight = Math.max(2, Math.round(height * 0.18));
    const top = DISPLAY_HEIGHT - BASE_INSET - height;
    bars.rect(x, top, BAR_WIDTH, height).fill(body);
    bars.rect(x, DISPLAY_HEIGHT - BASE_INSET - baseHeight, BAR_WIDTH, baseHeight).fill(base);
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
