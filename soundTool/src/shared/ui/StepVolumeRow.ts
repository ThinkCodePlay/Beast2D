import {
  Container,
  Graphics,
  Rectangle,
  type FederatedPointerEvent,
} from "pixi.js";
import { trackDrag } from "./Pressable";
import { STEP_COUNT, STEP_LEFT, STEP_STEP, STEP_WIDTH } from "./stepGrid";
import {
  paintStepVolume,
  toStepVolume,
  type SoundSequence,
} from "../audio/model";
import type { EditSession } from "../bank";

/** Highest volume a step can hold; the row shows STEP_VOLUME_MAX + 1 levels. */
export const STEP_VOLUME_MAX = 7;

const BODY = 0x38a1f0;
const BASE = 0x1f5cc7;
const SLOT = 0x274a86;
const TOP_LIGHT = 0x9fdcff;
const BASE_INSET = 1;

/**
 * Per-step volume row under the pitch bars: 32 blue columns sharing the pitch
 * grid. Press or drag across the row to paint a level into every column the
 * pointer crosses, like a tracker. Reads and writes the shared SoundSequence.
 * Mouse, touch and pen all work the same.
 */
export class StepVolumeRow extends Container {
  private readonly bars = new Graphics();

  constructor(
    private readonly sequence: SoundSequence,
    width: number,
    private readonly rowHeight: number,
    private readonly onVolumeChange?: (index: number) => void,
    private readonly editSession?: EditSession,
  ) {
    super();
    this.hitArea = new Rectangle(0, 0, width, rowHeight);
    this.addChild(this.bars);
    this.redraw();
    trackDrag(this, {
      onStart: () => this.editSession?.beginEdit(),
      onMove: (event) => this.paint(event),
      onEnd: () => this.editSession?.endEdit(),
    });
  }

  private paint(event: FederatedPointerEvent): void {
    const point = event.getLocalPosition(this);
    this.paintAt(point.x, point.y);
  }

  /** Paint the step under a local point. Returns true when a volume changed. */
  paintAt(x: number, y: number): boolean {
    const step = Math.round((x - STEP_LEFT - STEP_WIDTH / 2) / STEP_STEP);
    if (step < 0 || step >= STEP_COUNT) return false;
    const band = this.rowHeight / (STEP_VOLUME_MAX + 1);
    const level = toStepVolume(Math.floor((this.rowHeight - y) / band));
    // Painting a level also re-enables a rest, matching the pitch grid.
    if (!paintStepVolume(this.sequence.steps[step], level)) return false;
    this.redraw();
    this.onVolumeChange?.(step);
    return true;
  }

  /** Redraw from the sequence (e.g. after a bank slot switch). */
  refresh(): void {
    this.redraw();
  }

  private redraw(): void {
    this.bars.clear();
    const floor = this.rowHeight - BASE_INSET;
    for (let step = 0; step < STEP_COUNT; step += 1) {
      const x = STEP_LEFT + step * STEP_STEP;
      // A dim slot line keeps silent steps visible against the frame.
      this.bars.rect(x, floor - 1, STEP_WIDTH, 1).fill(SLOT);
      const barHeight =
        (this.sequence.steps[step].volume * (this.rowHeight - 2)) /
        STEP_VOLUME_MAX;
      if (barHeight <= 0) continue;
      const top = floor - barHeight;
      const baseHeight = Math.max(1, Math.round(barHeight * 0.18));
      this.bars.rect(x, top, STEP_WIDTH, barHeight).fill(BODY);
      this.bars.rect(x, floor - baseHeight, STEP_WIDTH, baseHeight).fill(BASE);
      this.bars.rect(x, top, STEP_WIDTH, 1).fill(TOP_LIGHT);
    }
  }
}
