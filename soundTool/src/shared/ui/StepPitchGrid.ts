import { Container, Graphics, Rectangle, type FederatedPointerEvent } from 'pixi.js';
import { trackDrag } from './Pressable';
import { STEP_COUNT, STEP_LEFT, STEP_STEP, STEP_WIDTH } from './stepGrid';
import { NOTE_WINDOW, NOTE_WINDOW_BASE, type SoundSequence } from '../audio/model';

const GOLD = 0xffd251;
const ORANGE = 0xf3864d;
const TOP_INSET = 8;
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
const PEAK = Math.max(...BAR_HEIGHTS);

/**
 * Starting notes matching the decorative envelope, so the board looks exactly
 * as before the first edit. Whole semitones, like drawn notes: each value is
 * the envelope's float rounded to the nearest semitone, which shifts a bar by
 * less than half a step and matches the sound the player always made.
 */
export function defaultNotes(): number[] {
  return BAR_HEIGHTS.map((height) => NOTE_WINDOW_BASE + Math.round(height / PEAK * (NOTE_WINDOW - 1)));
}

/**
 * The 32 pitch steps: press or drag to raise and lower each bar to a semitone
 * in the window, painting every column the pointer crosses. Reads and writes
 * the shared SoundSequence. Mouse, touch and pen all work the same.
 */
export class StepPitchGrid extends Container {
  private readonly bars = new Graphics();

  constructor(
    private readonly sequence: SoundSequence,
    width: number,
    private readonly areaBottom: number,
    private readonly onNoteChange?: (index: number) => void,
  ) {
    super();
    this.hitArea = new Rectangle(0, TOP_INSET, width, areaBottom - TOP_INSET);
    this.addChild(this.bars);
    this.redraw();
    trackDrag(this, (event) => this.paint(event));
  }

  private paint(event: FederatedPointerEvent): void {
    const point = event.getLocalPosition(this);
    this.paintAt(point.x, point.y);
  }

  /** Paint the step under a local point. Returns true when a note changed. */
  paintAt(x: number, y: number): boolean {
    const step = Math.round((x - STEP_LEFT - STEP_WIDTH / 2) / STEP_STEP);
    if (step < 0 || step >= STEP_COUNT) return false;
    const usable = this.areaBottom - TOP_INSET;
    const t = (this.areaBottom - y) / usable;
    const offset = Math.max(0, Math.min(NOTE_WINDOW - 1, Math.round(t * (NOTE_WINDOW - 1))));
    const note = NOTE_WINDOW_BASE + offset;
    if (this.sequence.steps[step].note === note) return false;
    this.sequence.steps[step].note = note;
    this.redraw();
    this.onNoteChange?.(step);
    return true;
  }

  /** Redraw from the sequence (e.g. after a bank slot switch). */
  refresh(): void {
    this.redraw();
  }

  private redraw(): void {
    this.bars.clear();
    const usable = this.areaBottom - TOP_INSET;
    for (let step = 0; step < STEP_COUNT; step += 1) {
      const x = STEP_LEFT + step * STEP_STEP;
      const offset = Math.max(0, Math.min(NOTE_WINDOW - 1,
        this.sequence.steps[step].note - NOTE_WINDOW_BASE));
      // A one-pixel stub keeps a bottom note visible on the baseline.
      const barHeight = Math.max(1, offset / (NOTE_WINDOW - 1) * usable);
      const t = step / (STEP_COUNT - 1);
      const body = lerpColor(GOLD, ORANGE, t * 0.45);
      const base = lerpColor(GOLD, ORANGE, 0.4 + t * 0.6);
      const baseHeight = Math.max(2, Math.round(barHeight * 0.18));
      const top = this.areaBottom - barHeight;
      this.bars.rect(x, top, STEP_WIDTH, barHeight).fill(body);
      this.bars.rect(x, this.areaBottom - baseHeight, STEP_WIDTH, baseHeight).fill(base);
      this.bars.rect(x, top, STEP_WIDTH, 1).fill(lerpColor(body, 0xffffff, 0.35));
    }
  }
}

function lerpColor(from: number, to: number, t: number): number {
  const r = Math.round((from >> 16 & 255) + ((to >> 16 & 255) - (from >> 16 & 255)) * t);
  const g = Math.round((from >> 8 & 255) + ((to >> 8 & 255) - (from >> 8 & 255)) * t);
  const b = Math.round((from & 255) + ((to & 255) - (from & 255)) * t);
  return r << 16 | g << 8 | b;
}
