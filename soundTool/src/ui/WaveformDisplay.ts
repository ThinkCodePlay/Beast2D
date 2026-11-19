import { Container, Graphics } from 'pixi.js';

const DISPLAY_HEIGHT = 16;
const BAR_WIDTH = 4;
const BAR_STEP = 8;
const BAR_BASELINE = 14;
const BAR_HEIGHTS = [4, 8, 12, 8, 4, 12, 8, 4, 8, 12, 4, 8, 12, 4, 8, 4, 12, 8, 4, 8, 12, 4, 8, 12, 8, 4, 12, 8, 4, 8, 12, 4];

/** Compact pixel waveform display. Width is supplied by its parent; height is 16px. */
export class WaveformDisplay extends Container {
  constructor(width: number) {
    super();
    this.addChild(drawWaveform(width));
  }
}

function drawWaveform(width: number): Graphics {
  const waveform = new Graphics()
    .rect(0, 0, width, DISPLAY_HEIGHT)
    .fill(0x241530)
    .rect(0, 0, width, 2)
    .fill(0x9260ad)
    .rect(0, DISPLAY_HEIGHT - 2, width, 2)
    .fill(0x39214c);

  BAR_HEIGHTS.forEach((height, index) => {
    const x = 4 + index * BAR_STEP;
    if (x + BAR_WIDTH > width - 4) return;
    waveform.rect(x, BAR_BASELINE - height, BAR_WIDTH, height)
      .fill(index < 22 ? 0xffcf72 : 0xff985f);
  });

  return waveform;
}
