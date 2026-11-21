import { Container, Graphics } from 'pixi.js';
import { StepVolumeRow } from './StepVolumeRow';

// Shared step grid: the pitch bars and the volume row align column for column.
export const STEP_COUNT = 32;
export const STEP_WIDTH = 8;
export const STEP_STEP = 9.5;
export const STEP_LEFT = 4;
const SECTION_COUNT = 8;
const STEPS_PER_SECTION = STEP_COUNT / SECTION_COUNT;
const BASE_INSET = 2.7;
const BAR_TOP_INSET = 8;
const VOLUME_ROW_HEIGHT = 16;
const VOLUME_ROW_GAP = 3;
const GOLD = 0xffd251;
const ORANGE = 0xf3864d;
// Reference pickup envelope: tall opening peak, uneven decay, short orange tail.
const REFERENCE_HEIGHTS = [
  48, 52, 45, 40, 34, 37, 39, 35, 32, 34, 29, 26, 25,
  28, 25, 22, 19, 16, 13, 16, 13, 12, 14, 11, 9, 7,
];
// Stretch the reference envelope to the step count, keeping its shape.
const BAR_HEIGHTS = Array.from({ length: STEP_COUNT }, (_, index) => {
  const position = index * (REFERENCE_HEIGHTS.length - 1) / (STEP_COUNT - 1);
  const lower = Math.floor(position);
  const upper = Math.min(lower + 1, REFERENCE_HEIGHTS.length - 1);
  return REFERENCE_HEIGHTS[lower] + (REFERENCE_HEIGHTS[upper] - REFERENCE_HEIGHTS[lower]) * (position - lower);
});

/**
 * Waveform window: the decorative pitch-bar profile on top, an editable blue
 * per-step volume row below it, both aligned to the same 32-step grid.
 */
export class WaveformDisplay extends Container {
  /** The volume row under the bars; holds the current level per step. */
  readonly stepVolumes: StepVolumeRow;

  constructor(width: number, height: number) {
    super();
    const barsBottom = height - BASE_INSET - VOLUME_ROW_HEIGHT - VOLUME_ROW_GAP;
    this.addChild(drawFrame(width, height, barsBottom));
    this.addChild(drawBars(barsBottom));
    const volumeRow = new StepVolumeRow(width, VOLUME_ROW_HEIGHT);
    volumeRow.position.set(0, height - BASE_INSET - VOLUME_ROW_HEIGHT);
    this.addChild(volumeRow);
    this.stepVolumes = volumeRow;
  }
}

function drawFrame(width: number, height: number, barsBottom: number): Graphics {
  const frame = new Graphics()
    .roundRect(0, 0, width, height, 2).fill(0x21132b)
    .roundRect(1, 1, width - 2, height - 2, 2).fill(0x3f2651);
  for (const x of sectionDividerPositions()) {
    frame.rect(x, 3, 1, height - 6).fill({ color: 0x76508c, alpha: 0.6 });
  }
  frame
    .roundRect(1, 1, width - 2, 3, 2).fill({ color: 0x59366e, alpha: 0.8 })
    .rect(1, height - 2, width - 2, 1).fill(0x39214c)
    // Separator between the pitch bars and the volume row.
    .rect(3, Math.round(barsBottom + VOLUME_ROW_GAP / 2), width - 6, 1)
    .fill({ color: 0x76508c, alpha: 0.6 });
  return frame;
}

/** Dividers between the eight sections, each section holding four steps. */
function sectionDividerPositions(): number[] {
  const halfGap = (STEP_STEP - STEP_WIDTH) / 2;
  return Array.from({ length: SECTION_COUNT - 1 }, (_, index) =>
    Math.round(STEP_LEFT + (index + 1) * STEPS_PER_SECTION * STEP_STEP - halfGap));
}

function drawBars(bottom: number): Graphics {
  // Scale the reference envelope so its peak fills the area at any height.
  const scale = (bottom - BAR_TOP_INSET) / Math.max(...BAR_HEIGHTS);
  const bars = new Graphics();
  for (let index = 0; index < STEP_COUNT; index += 1) {
    const x = STEP_LEFT + index * STEP_STEP;
    const barHeight = Math.min(BAR_HEIGHTS[index] * scale, bottom - BAR_TOP_INSET);
    const t = index / (STEP_COUNT - 1);
    const body = lerpColor(GOLD, ORANGE, t * 0.45);
    const base = lerpColor(GOLD, ORANGE, 0.4 + t * 0.6);
    const baseHeight = Math.max(2, Math.round(barHeight * 0.18));
    const top = bottom - barHeight;
    bars.rect(x, top, STEP_WIDTH, barHeight).fill(body);
    bars.rect(x, bottom - baseHeight, STEP_WIDTH, baseHeight).fill(base);
    bars.rect(x, top, STEP_WIDTH, 1).fill(lerpColor(body, 0xffffff, 0.35));
  }
  return bars;
}

function lerpColor(from: number, to: number, t: number): number {
  const r = Math.round((from >> 16 & 255) + ((to >> 16 & 255) - (from >> 16 & 255)) * t);
  const g = Math.round((from >> 8 & 255) + ((to >> 8 & 255) - (from >> 8 & 255)) * t);
  const b = Math.round((from & 255) + ((to & 255) - (from & 255)) * t);
  return r << 16 | g << 8 | b;
}
