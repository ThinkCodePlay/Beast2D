import { Container, Graphics } from 'pixi.js';

const DISPLAY_HEIGHT = 60;
const BAR_WIDTH = 4;
const BAR_STEP = 8;
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
    .rect(0, 0, width, DISPLAY_HEIGHT).fill(0x241530)
    .rect(0, 0, width, 2).fill(0x9260ad)
    .rect(0, DISPLAY_HEIGHT - 2, width, 2).fill(0x39214c);

  for (let x = 8; x < width; x += 16) {
    waveform.rect(x, 4, 1, DISPLAY_HEIGHT - 8).fill({ color: 0x76508c, alpha: 0.45 });
  }

  BAR_HEIGHTS.forEach((height, index) => {
    const x = 4 + index * BAR_STEP;
    if (x + BAR_WIDTH > width - 4) return;
    const color = index > 22 ? 0xff9257 : WAVE_COLOR;
    const barHeight = Math.min(height, DISPLAY_HEIGHT - 8);
    waveform.rect(x, DISPLAY_HEIGHT - 4 - barHeight, BAR_WIDTH, barHeight).fill(color);
    waveform.rect(x, DISPLAY_HEIGHT - 6, BAR_WIDTH, 2).fill(index > 22 ? 0xf16d5a : 0xffa643);
  });
  return waveform;
}
