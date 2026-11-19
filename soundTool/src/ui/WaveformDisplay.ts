import { Container, Graphics } from 'pixi.js';

const DISPLAY_HEIGHT = 60;
const BAR_WIDTH = 8;
const BAR_STEP = 10;
// A decaying pickup sound: strong opening hit, quick fall, then a short tail.
const BAR_HEIGHTS = [
  40, 52, 46, 40, 34, 31, 28, 30, 26, 24, 28, 22, 20, 24, 18, 21,
  16, 19, 14, 17, 13, 16, 12, 14, 10, 13, 9, 11, 8, 9, 7, 8,
];
const WAVE_COLOR = 0xffd04d;

/** Tall waveform window with grid lines and a decaying, gold-to-orange profile. */
export class WaveformDisplay extends Container {
  constructor(width: number) {
    super();
    this.addChild(drawWaveform(width));
  }
}

function drawWaveform(width: number): Graphics {
  const waveform = new Graphics()
    .rect(0, 0, width, DISPLAY_HEIGHT).fill(0x21132b)
    .rect(2, 2, width - 4, DISPLAY_HEIGHT - 4).fill(0x241530)
    .rect(3, 3, width - 6, 1).fill(0x76508c)
    .rect(3, 3, 1, DISPLAY_HEIGHT - 6).fill(0x76508c)
    .rect(3, DISPLAY_HEIGHT - 4, width - 6, 1).fill(0x39214c)
    .rect(width - 4, 3, 1, DISPLAY_HEIGHT - 6).fill(0x39214c);

  for (let x = 8; x < width - 4; x += 16) {
    waveform.rect(x, 5, 1, DISPLAY_HEIGHT - 10).fill({ color: 0x76508c, alpha: 0.45 });
  }

  BAR_HEIGHTS.forEach((height, index) => {
    const x = 4 + index * BAR_STEP;
    if (x + BAR_WIDTH > width - 4) return;
    const color = index > 22 ? 0xff9257 : WAVE_COLOR;
    const barHeight = Math.min(height, DISPLAY_HEIGHT - 10);
    waveform.rect(x + 1, DISPLAY_HEIGHT - 5 - barHeight, BAR_WIDTH - 1, barHeight).fill(color);
    waveform.rect(x + 1, DISPLAY_HEIGHT - 7, BAR_WIDTH - 1, 2).fill(index > 22 ? 0xf16d5a : 0xffa643);
  });
  return waveform;
}
