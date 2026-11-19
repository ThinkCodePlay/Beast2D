import { Container, Graphics } from 'pixi.js';

const DISPLAY_HEIGHT = 56;
const BAR_WIDTH = 4;
const BAR_STEP = 8;
const BAR_HEIGHTS = [40, 56, 72, 64, 48, 36, 44, 32, 40, 28, 36, 24, 32, 24, 40, 32, 48, 56, 36, 32, 44, 28, 36, 24, 32, 28, 40, 36, 24, 32, 40, 28];
const WAVE_COLOR = 0xffcf72;

/** Tall waveform window with grid lines and gold-to-orange bars. */
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
    const barHeight = Math.min(height, DISPLAY_HEIGHT - 8);
    const color = index > 21 ? 0xff985f : WAVE_COLOR;
    waveform.rect(x, DISPLAY_HEIGHT - 4 - barHeight, BAR_WIDTH, barHeight).fill(color);
  });
  return waveform;
}
