import { Container, Graphics, Text } from 'pixi.js';
import { PresetPad, type PresetIcon, type PresetTextures } from './PresetPad';
import { PixelButton } from './ui/PixelButton';
import { RaisedPanelFrame } from './ui/RaisedPanelFrame';
import { WaveformDisplay } from './ui/WaveformDisplay';
import { WaveformSelector } from './WaveformSelector';
import type { SoundSequence } from './audio/model';

export interface TransportActions {
  play(): void;
  stop(): void;
  audition(index: number): void;
  setMasterVolume(value: number): void;
  setPan(value: number): void;
  setCutoff(value: number): void;
  /** Flips the loop latch; returns the new state so the button can show it. */
  toggleLoop(): boolean;
}

const PAD_GRID_LEFT = 8.3;
const PAD_STEP_X = 160 / 3; // 160 output pixels at the 3× stage scale.
const PAD_WIDTH = 45;
const PAD_ROW_TOP = 54;
const PAD_HEIGHT = 36;
const TRANSPORT_ROW_TOP = 12;
const LCD_GAP = 16 / 3;
const LCD_RIGHT_INSET = 8;
const WAVEFORM_TOP_GAP = 11 / 3;
const WAVEFORM_BOTTOM_INSET = 5;
const SELECTOR_HEIGHT = 30;
const SELECTOR_TOP_GAP = 4;

// The kept presets: the most-used game sound types, one pad per type, matching
// the sound bank (coin, power-up, jump, explosion, hit, enemy death).
const KEPT_PRESETS: readonly PresetIcon[] = ['coin', 'star', 'boot', 'bomb', 'burst', 'skull'];

/** Sound editor panel. The shared knobs and edit control live in its own strip. */
export class SoundCreationPanel extends Container {
  constructor(width: number, height: number, presetTextures: PresetTextures, sequence: SoundSequence, transport: TransportActions) {
    super();
    this.addChild(new RaisedPanelFrame(width, height, 0x83609a));
    this.addChild(createTransport(width, transport));
    this.addChild(createPresetGrid(presetTextures));
    const waveformTop = PAD_ROW_TOP + PAD_HEIGHT + WAVEFORM_TOP_GAP;
    const selectorTop = height - WAVEFORM_BOTTOM_INSET - SELECTOR_HEIGHT;
    // Pitch and volume edits both audition the edited step.
    const waveform = new WaveformDisplay(width - 11, selectorTop - SELECTOR_TOP_GAP - waveformTop, sequence, transport.audition, transport.audition);
    waveform.position.set(8, waveformTop);
    this.addChild(waveform);
    const selector = new WaveformSelector(sequence.waveform, PAD_STEP_X, (type) => { sequence.waveform = type; });
    selector.position.set(PAD_GRID_LEFT, selectorTop);
    this.addChild(selector);
  }
}

function createTransport(panelWidth: number, actions: TransportActions): Container {
  const row = new Container();
  row.position.y = TRANSPORT_ROW_TOP;
  // Transport buttons match the preset pads exactly: same size, same columns.
  const play = new PixelButton('▶', 'pink', false, PAD_WIDTH, PAD_HEIGHT);
  const stop = new PixelButton('■', 'cream', false, PAD_WIDTH, PAD_HEIGHT);
  const loop = new PixelButton('↻', 'green', false, PAD_WIDTH, PAD_HEIGHT);
  play.on('pointertap', actions.play);
  stop.on('pointertap', actions.stop);
  loop.on('pointertap', () => loop.setLatched(actions.toggleLoop()));
  [play, stop, loop].forEach((button, index) => {
    button.position.x = PAD_GRID_LEFT + index * PAD_STEP_X;
  });
  // The sound-name LCD takes the rest of the row, up to the panel's right inset.
  const lcdLeft = PAD_GRID_LEFT + 2 * PAD_STEP_X + PAD_WIDTH + LCD_GAP;
  const namePlate = createSoundName(panelWidth - LCD_RIGHT_INSET - lcdLeft);
  namePlate.position.set(lcdLeft, 2);
  row.addChild(play, stop, loop, namePlate);
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
  grid.position.set(PAD_GRID_LEFT, PAD_ROW_TOP);
  KEPT_PRESETS.forEach((icon, index) => {
    const pad = new PresetPad(icon, presetTextures, index === 0);
    pad.position.x = index * PAD_STEP_X;
    grid.addChild(pad);
  });
  return grid;
}
