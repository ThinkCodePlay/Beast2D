import {
  BANK_LEFT,
  BOARD_WIDTH,
  CONTENT_INSET,
  CONTENT_TOP,
  CONTROLS_INSET,
  CONTROLS_TOP,
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
  TRANSPORT_LEFT,
  TRANSPORT_TOP,
} from '../SoundCreationPanel';
import { PAD_WIDTH, PAD_HEIGHT, type PresetIcon } from '../PresetPad';
import { KNOB_CENTER } from '../ui/PixelKnob';
import {
  EDIT_POSITION,
  KNOB_FIRST_LEFT,
  KNOB_PITCH,
  KNOB_TILE_INSET,
  KNOB_TOP,
  KNOBS,
} from '../SoundControlStrip';
import { EDIT_WIDTH, EDIT_HEIGHT } from '../EditButton';
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

/** Centers and values of the six strip dials. */
export const STRIP_KNOBS = KNOBS.map((knob, index) => {
  const tileLeft = CONTROLS_INSET + KNOB_FIRST_LEFT + index * KNOB_PITCH;
  return {
    ...knob,
    cx: tileLeft + KNOB_TILE_INSET + KNOB_CENTER.x,
    cy: CONTROLS_TOP + KNOB_TOP + KNOB_CENTER.y,
    radius: 13,
  };
});

/** The wide waveform-edit button at the strip's right end. */
export const EDIT_BUTTON: ControlRect = {
  x: CONTROLS_INSET + EDIT_POSITION.x,
  y: CONTROLS_TOP + EDIT_POSITION.y,
  width: EDIT_WIDTH,
  height: EDIT_HEIGHT,
};

/** The header's RUN badge. */
export const RUN_BUTTON: ControlRect = {
  x: HEADER_INSET + (BOARD_WIDTH - HEADER_INSET * 2) - RUN_RIGHT_INSET,
  y: HEADER_TOP,
  width: RUN_WIDTH,
  height: RUN_HEIGHT,
};

const BANK_WIDTH = 159;
const BANK_HEIGHT = 204;

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
