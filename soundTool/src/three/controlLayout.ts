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
  MASTER_KNOB_SCALE,
  PAD_GRID_LEFT,
  PAD_GRID_TOP,
  PAD_STEP_X,
  PAD_STEP_Y,
  TRANSPORT_LEFT,
  TRANSPORT_POSITIONS,
  TRANSPORT_SCALE,
  TRANSPORT_TOP,
} from '../SoundCreationPanel';
import { PAD_WIDTH, PAD_HEIGHT, PRESET_ICONS } from '../PresetPad';
import { BUTTON_SIZE } from '../ui/PixelButton';
import { knobCenter } from '../ui/PixelKnob';
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

function centered(rect: ControlRect): { cx: number; cy: number } {
  return { cx: rect.x + rect.width / 2, cy: rect.y + rect.height / 2 };
}

const TRANSPORT_BUTTON = BUTTON_SIZE * TRANSPORT_SCALE;

/** Play / stop / loop buttons across the creation panel's transport row. */
const TRANSPORT_SPECS = [
  { icon: '▶', tone: 'pink', offset: 0 },
  { icon: '■', tone: 'cream', offset: TRANSPORT_POSITIONS.stop },
  { icon: '↻', tone: 'green', offset: TRANSPORT_POSITIONS.loop },
] as const;

export const TRANSPORT_BUTTONS: (ControlRect & { icon: '▶' | '■' | '↻'; tone: 'pink' | 'cream' | 'green' })[] =
  TRANSPORT_SPECS.map(({ icon, tone, offset }) => ({
  icon,
  tone,
  x: CONTENT_INSET + TRANSPORT_LEFT + offset,
  y: CONTENT_TOP + TRANSPORT_TOP + 1.5,
  width: TRANSPORT_BUTTON,
  height: TRANSPORT_BUTTON,
}));

/** Twelve preset pads in their 6×2 grid. */
export const PRESET_PADS: (ControlRect & { icon: (typeof PRESET_ICONS)[number]; selected: boolean })[] =
  PRESET_ICONS.map((icon, index) => ({
    icon,
    selected: index === 0,
    x: CONTENT_INSET + PAD_GRID_LEFT + (index % 6) * PAD_STEP_X,
    y: CONTENT_TOP + PAD_GRID_TOP + Math.floor(index / 6) * PAD_STEP_Y,
    width: PAD_WIDTH,
    height: PAD_HEIGHT,
  }));

const MASTER_CENTER = knobCenter('master');
const MASTER_SCALE = MASTER_KNOB_SCALE;

/** Center and radius of the master volume rotor. */
export const MASTER_KNOB = (() => {
  const { cx, cy } = centered({
    x: CONTENT_INSET + TRANSPORT_LEFT + TRANSPORT_POSITIONS.volume,
    y: CONTENT_TOP + TRANSPORT_TOP - 8,
    width: 0,
    height: 0,
  });
  return {
    cx: cx + MASTER_CENTER.x * MASTER_SCALE,
    cy: cy + MASTER_CENTER.y * MASTER_SCALE,
    value: 0.5,
    color: 0xff91c8,
    radius: 14 * MASTER_SCALE,
  };
})();

/** Centers and values of the six strip dials. */
export const STRIP_KNOBS = KNOBS.map((knob, index) => {
  const tileLeft = CONTROLS_INSET + KNOB_FIRST_LEFT + index * KNOB_PITCH;
  return {
    ...knob,
    cx: tileLeft + KNOB_TILE_INSET + knobCenter('standard').x,
    cy: CONTROLS_TOP + KNOB_TOP + knobCenter('standard').y,
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
