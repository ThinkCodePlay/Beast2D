import { Container, Graphics, Text } from 'pixi.js';
import type { ControlMode } from './controls';
import { PAD_HEIGHT, PAD_WIDTH, PresetPad, type PresetIcon, type PresetTextures } from './PresetPad';
import { PixelButton } from './ui/PixelButton';
import { RaisedPanelFrame } from './ui/RaisedPanelFrame';
import { WaveformDisplay } from './ui/WaveformDisplay';

export const PAD_STEP_X = 160 / 3; // 160 output pixels at the 3× stage scale.
export const PAD_GRID_LEFT = 8.3;
export const PAD_GRID_TOP = 54;
export const TRANSPORT_LEFT = 8.3;
export const TRANSPORT_TOP = 12;
const LCD_GAP = 16 / 3;
const LCD_RIGHT_INSET = 8;
const WAVEFORM_TOP_GAP = 11 / 3;
const WAVEFORM_BOTTOM_INSET = 5;

// The kept presets: the most-used game sound types, one pad per type, matching
// the sound bank (coin, power-up, jump, explosion, hit, enemy death).
export const KEPT_PRESETS: readonly PresetIcon[] = ['coin', 'star', 'boot', 'bomb', 'burst', 'skull'];

/** Sound editor panel. The shared knobs and edit control live in its own strip. */
export class SoundCreationPanel extends Container {
  constructor(width: number, height: number, presetTextures: PresetTextures, controls: ControlMode = '2d') {
    super();
    this.addChild(new RaisedPanelFrame(width, height, 0x83609a));
    this.addChild(createTransport(width, controls));
    if (controls === '2d') this.addChild(createPresetGrid(presetTextures));
    // The waveform fills the freed space between the pads and the panel bottom.
    const waveformTop = PAD_GRID_TOP + PAD_HEIGHT + WAVEFORM_TOP_GAP;
    const waveform = new WaveformDisplay(width - 11, height - WAVEFORM_BOTTOM_INSET - waveformTop);
    waveform.position.set(8, waveformTop);
    this.addChild(waveform);
  }
}

function createTransport(panelWidth: number, controls: ControlMode): Container {
  const row = new Container();
  row.position.set(TRANSPORT_LEFT, TRANSPORT_TOP);
  // Transport buttons match the preset pads exactly: same size, same columns.
  if (controls === '2d') {
    const play = new PixelButton('▶', 'pink', false, PAD_WIDTH, PAD_HEIGHT);
    const stop = new PixelButton('■', 'cream', false, PAD_WIDTH, PAD_HEIGHT);
    const loop = new PixelButton('↻', 'green', false, PAD_WIDTH, PAD_HEIGHT);
    [play, stop, loop].forEach((button, index) => {
      button.position.x = index * PAD_STEP_X;
    });
    row.addChild(play, stop, loop);
  }
  // The sound-name LCD takes the rest of the row, up to the panel's right inset.
  const lcdLeft = 2 * PAD_STEP_X + PAD_WIDTH + LCD_GAP;
  const namePlate = createSoundName(panelWidth - TRANSPORT_LEFT - LCD_RIGHT_INSET - lcdLeft);
  namePlate.position.set(lcdLeft, 2);
  row.addChild(namePlate);
  return row;
}

function createSoundName(width: number): Container {
  const plate = new Container();
  const face = new Graphics()
    .roundRect(0, 0, width, 32, 4).fill(0x24152e)
    .roundRect(2, 2, width - 4, 28, 3).fill(0x7d4f99)
    .roundRect(3, 3, width - 6, 26, 3).fill(0x371c51)
    .roundRect(4, 4, width - 8, 9, 2).fill({ color: 0x4a2c66, alpha: 0.6 });
  const name = new Text({
    text: 'coin_pickup',
    style: { fontFamily: 'monogram', fontSize: 16, fontWeight: 'bold', fill: 0xffeaff, stroke: { color: 0x2a1440, width: 1 } }, resolution: 3,
  });
  name.position.set(8, 6);
  plate.addChild(face, name);
  return plate;
}

function createPresetGrid(presetTextures: PresetTextures): Container {
  const grid = new Container();
  grid.position.set(PAD_GRID_LEFT, PAD_GRID_TOP);
  KEPT_PRESETS.forEach((icon, index) => {
    const pad = new PresetPad(icon, presetTextures, index === 0);
    pad.position.x = index * PAD_STEP_X;
    grid.addChild(pad);
  });
  return grid;
}
