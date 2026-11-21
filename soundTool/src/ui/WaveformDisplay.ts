import { Container, Graphics } from 'pixi.js';
import { STEP_COUNT, STEP_LEFT, STEP_STEP, STEP_WIDTH } from './stepGrid';
import { StepPitchGrid, defaultNotes } from './StepPitchGrid';
import { StepVolumeRow } from './StepVolumeRow';
import { createSoundSequence, type SoundSequence } from '../audio/model';

const SECTION_COUNT = 8;
const STEPS_PER_SECTION = STEP_COUNT / SECTION_COUNT;
const BASE_INSET = 2.7;
const VOLUME_ROW_HEIGHT = 16;
const VOLUME_ROW_GAP = 3;

/**
 * Waveform window: the editable pitch steps on top, an editable blue per-step
 * volume row below, both aligned to the same 32-step grid and both editing
 * the shared sound sequence.
 */
export class WaveformDisplay extends Container {
  /** The sound both rows display and edit. In memory only, nothing persists it. */
  readonly sequence: SoundSequence;
  private readonly pitchGrid: StepPitchGrid;
  private readonly volumeRow: StepVolumeRow;
  private readonly volumeRowTop: number;

  constructor(width: number, height: number, sequence = createSoundSequence(defaultNotes())) {
    super();
    this.sequence = sequence;
    const barsBottom = height - BASE_INSET - VOLUME_ROW_HEIGHT - VOLUME_ROW_GAP;
    this.volumeRowTop = height - BASE_INSET - VOLUME_ROW_HEIGHT;
    this.addChild(drawFrame(width, height, barsBottom));
    this.pitchGrid = new StepPitchGrid(this.sequence, width, barsBottom);
    this.addChild(this.pitchGrid);
    this.volumeRow = new StepVolumeRow(this.sequence, width, VOLUME_ROW_HEIGHT);
    this.volumeRow.position.set(0, this.volumeRowTop);
    this.addChild(this.volumeRow);
  }

  /**
   * Edit the step under a display-local point, routing to the pitch grid or
   * the volume row by zone. Returns true when a value changed. Used by the 3D
   * scene, where the display has no pointer events of its own.
   */
  paintAt(x: number, y: number): boolean {
    if (y >= this.volumeRowTop) return this.volumeRow.paintAt(x, y - this.volumeRowTop);
    return this.pitchGrid.paintAt(x, y);
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
