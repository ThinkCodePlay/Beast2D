import {
  BANK_LEFT,
  BOARD_WIDTH,
  CONTENT_HEIGHT,
  CONTENT_INSET,
  CONTENT_TOP,
  CONTROLS_INSET,
  CONTROLS_TOP,
  CREATION_WIDTH,
  HEADER_INSET,
  HEADER_TOP,
} from '../SoundBoardFrame';
import { RUN_RIGHT_INSET } from '../SoundBoardHeader';
import { RUN_WIDTH, RUN_HEIGHT } from '../RunButton';
import {
  KEPT_PRESETS,
  PAD_GRID_LEFT,
  PAD_GRID_TOP,
  PAD_STEP_X,
  SELECTOR_HEIGHT,
  SELECTOR_TOP_GAP,
  TRANSPORT_LEFT,
  TRANSPORT_TOP,
  WAVEFORM_BOTTOM_INSET,
  WAVEFORM_LEFT_INSET,
  WAVEFORM_RIGHT_INSET,
  WAVEFORM_TOP_GAP,
} from '../SoundCreationPanel';
import { PAD_WIDTH, PAD_HEIGHT, type PresetIcon } from '../PresetPad';
import { KNOB_CENTER } from '../ui/PixelKnob';
import {
  KNOB_GRID_LEFT,
  KNOB_STEP_X,
  KNOB_TILE_INSET,
  KNOB_TOP,
  KNOBS,
} from '../SoundControlStrip';
import { WAVEFORM_TYPES, type WaveformType } from '../WaveformButton';
import { SCROLL_BUTTON_SIZE, SCROLL_INSET, SCROLL_TRACK_TOP } from '../SoundBankPanel';

/** A control's face rectangle in board-design coordinates (top-left origin). */
export interface ControlRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Play / stop / loop buttons across the creation panel's transport row,
 * each matching a preset pad exactly: same size, same column. */
const TRANSPORT_SPECS = [
  { icon: '▶', tone: 'pink' },
  { icon: '■', tone: 'cream' },
  { icon: '↻', tone: 'green' },
] as const;

export const TRANSPORT_BUTTONS: (ControlRect & { icon: '▶' | '■' | '↻'; tone: 'pink' | 'cream' | 'green' })[] =
  TRANSPORT_SPECS.map(({ icon, tone }, index) => ({
  icon,
  tone,
  x: CONTENT_INSET + TRANSPORT_LEFT + index * PAD_STEP_X,
  y: CONTENT_TOP + TRANSPORT_TOP,
  width: PAD_WIDTH,
  height: PAD_HEIGHT,
}));

/** The kept preset pads in their single row. */
export const PRESET_PADS: (ControlRect & { icon: PresetIcon; selected: boolean })[] =
  KEPT_PRESETS.map((icon, index) => ({
    icon,
    selected: index === 0,
    x: CONTENT_INSET + PAD_GRID_LEFT + index * PAD_STEP_X,
    y: CONTENT_TOP + PAD_GRID_TOP,
    width: PAD_WIDTH,
    height: PAD_HEIGHT,
  }));

/** The waveform selector row under the display, one button per preset column. */
export const WAVEFORM_BUTTONS: (ControlRect & { type: WaveformType; selected: boolean })[] =
  WAVEFORM_TYPES.map((type, index) => ({
    type,
    selected: index === 0,
    x: CONTENT_INSET + PAD_GRID_LEFT + index * PAD_STEP_X,
    y: CONTENT_TOP + CONTENT_HEIGHT - WAVEFORM_BOTTOM_INSET - SELECTOR_HEIGHT,
    width: 45,
    height: SELECTOR_HEIGHT,
  }));

/** The creation panel's waveform display, at its exact 2D position. In 3D the
 * scene draws it here as a live editable mesh instead of flat panel artwork. */
export const WAVEFORM_DISPLAY: ControlRect = {
  x: CONTENT_INSET + WAVEFORM_LEFT_INSET,
  y: CONTENT_TOP + PAD_GRID_TOP + PAD_HEIGHT + WAVEFORM_TOP_GAP,
  width: CREATION_WIDTH - WAVEFORM_LEFT_INSET - WAVEFORM_RIGHT_INSET,
  height:
    CONTENT_HEIGHT - WAVEFORM_BOTTOM_INSET - SELECTOR_HEIGHT - SELECTOR_TOP_GAP
    - PAD_GRID_TOP - PAD_HEIGHT - WAVEFORM_TOP_GAP,
};

/** Centers and values of the six strip dials, aligned to the selector columns. */
export const STRIP_KNOBS = KNOBS.map((knob, index) => {
  const tileLeft = CONTROLS_INSET + KNOB_GRID_LEFT + index * KNOB_STEP_X;
  return {
    ...knob,
    cx: tileLeft + KNOB_TILE_INSET + KNOB_CENTER.x,
    // Raised toward the dial top so the 3D rotor body clears the flat label.
    cy: CONTROLS_TOP + KNOB_TOP + KNOB_CENTER.y - 3,
    radius: 11,
  };
});

/** The header's RUN badge. */
export const RUN_BUTTON: ControlRect = {
  x: HEADER_INSET + (BOARD_WIDTH - HEADER_INSET * 2) - RUN_RIGHT_INSET,
  y: HEADER_TOP - 1.5,
  width: RUN_WIDTH,
  height: RUN_HEIGHT,
};

const BANK_WIDTH = 159;
// The bank runs full height: from the content top to the control strip's bottom.
const BANK_HEIGHT = CONTROLS_TOP + 157 / 3 - CONTENT_TOP;

/** The sound bank's two scroll-arrow buttons. */
export const SCROLL_ARROWS: (ControlRect & { up: boolean })[] = [true, false].map((up) => ({
  up,
  x: BANK_LEFT + BANK_WIDTH - SCROLL_BUTTON_SIZE - SCROLL_INSET,
  y: up
    ? CONTENT_TOP + SCROLL_TRACK_TOP
    : CONTENT_TOP + BANK_HEIGHT - SCROLL_BUTTON_SIZE - SCROLL_INSET,
  width: SCROLL_BUTTON_SIZE,
  height: SCROLL_BUTTON_SIZE,
}));
