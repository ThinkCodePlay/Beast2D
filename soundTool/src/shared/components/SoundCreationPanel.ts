import { Container, Graphics, Text } from 'pixi.js';
import type { ControlMode } from '../controls';
import type { TransportActions } from '../transport';
import { PAD_HEIGHT, PAD_WIDTH, PresetPad, type PresetIcon, type PresetTextures } from './PresetPad';
import { PixelButton } from '../ui/PixelButton';
import { RaisedPanelFrame } from '../ui/RaisedPanelFrame';
import { WaveformDisplay } from '../ui/WaveformDisplay';
import { WaveformSelector } from './WaveformSelector';
import type { SoundSequence } from '../audio/model';

/**
 * Sound editor panel: transport row and name LCD on top, preset pads, the
 * editable waveform display and the waveform selector. The board's knobs live
 * in their own strip (SoundControlStrip). In '3d' control mode only the flat
 * artwork is drawn - the 3D scene places real controls on top (see
 * src/3d/three/controlLayout.ts).
 */

export const PAD_STEP_X = 160 / 3; // 160 output pixels at the 3× stage scale.
export const PAD_GRID_LEFT = 8.3;
export const PAD_GRID_TOP = 54;
export const TRANSPORT_LEFT = 8.3;
export const TRANSPORT_TOP = 12;
const LCD_GAP = 16 / 3;
const LCD_RIGHT_INSET = 8;
export const WAVEFORM_TOP_GAP = 11 / 3;
export const WAVEFORM_LEFT_INSET = 8;
export const WAVEFORM_RIGHT_INSET = 3;
export const WAVEFORM_BOTTOM_INSET = 5;
export const SELECTOR_HEIGHT = 30;
export const SELECTOR_TOP_GAP = 4;

// The kept presets: the most-used game sound types, one pad per type, matching
// the sound bank (coin, power-up, jump, explosion, hit, enemy death).
export const KEPT_PRESETS: readonly PresetIcon[] = ['coin', 'star', 'boot', 'bomb', 'burst', 'skull'];

export interface SoundCreationPanelOptions {
  /** Transport and live-dial callbacks; required in '2d' mode, unused in '3d'. */
  transport?: TransportActions;
  /** '2d' draws and wires the controls, '3d' draws flat artwork only. Default '2d'. */
  controls?: ControlMode;
}

export class SoundCreationPanel extends Container {
  constructor(width: number, height: number, presetTextures: PresetTextures, sequence: SoundSequence, options: SoundCreationPanelOptions = {}) {
    super();
    const controls = options.controls ?? '2d';
    this.addChild(new RaisedPanelFrame(width, height, 0x83609a));
    this.addChild(createTransport(width, controls, options.transport));
    if (controls === '2d') {
      if (!options.transport) throw new Error('SoundCreationPanel 2D mode needs transport actions.');
      const transport = options.transport;
      this.addChild(createPresetGrid(presetTextures));
      const waveformTop = PAD_GRID_TOP + PAD_HEIGHT + WAVEFORM_TOP_GAP;
      const selectorTop = height - WAVEFORM_BOTTOM_INSET - SELECTOR_HEIGHT;
      // Pitch and volume edits both audition the edited step.
      const waveform = new WaveformDisplay(width - WAVEFORM_LEFT_INSET - WAVEFORM_RIGHT_INSET, selectorTop - SELECTOR_TOP_GAP - waveformTop, sequence, transport.audition, transport.audition);
      waveform.position.set(WAVEFORM_LEFT_INSET, waveformTop);
      this.addChild(waveform);
      const selector = new WaveformSelector(sequence.waveform, PAD_STEP_X, (type) => { sequence.waveform = type; });
      selector.position.set(PAD_GRID_LEFT, selectorTop);
      this.addChild(selector);
    }
  }
}

function createTransport(panelWidth: number, controls: ControlMode, transport?: TransportActions): Container {
  const row = new Container();
  row.position.set(TRANSPORT_LEFT, TRANSPORT_TOP);
  // Transport buttons match the preset pads exactly: same size, same columns.
  if (controls === '2d' && transport) {
    const play = new PixelButton('▶', 'pink', false, PAD_WIDTH, PAD_HEIGHT);
    const stop = new PixelButton('■', 'cream', false, PAD_WIDTH, PAD_HEIGHT);
    const loop = new PixelButton('↻', 'green', false, PAD_WIDTH, PAD_HEIGHT);
    play.on('pointertap', transport.play);
    stop.on('pointertap', transport.stop);
    loop.on('pointertap', () => loop.setLatched(transport.toggleLoop()));
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
