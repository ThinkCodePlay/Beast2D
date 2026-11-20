import { Container, Graphics, Text } from 'pixi.js';
import type { ControlMode } from './controls';
import { PresetPad, PRESET_ICONS, type PresetTextures } from './PresetPad';
import { PixelButton } from './ui/PixelButton';
import { PixelKnob, KnobMarkings } from './ui/PixelKnob';
import { RaisedPanelFrame } from './ui/RaisedPanelFrame';
import { WaveformDisplay } from './ui/WaveformDisplay';

export const PAD_STEP_X = 160 / 3; // 160 output pixels at the 3× stage scale.
export const PAD_STEP_Y = 46;
export const PAD_GRID_LEFT = 8.3;
export const PAD_GRID_TOP = 54;
export const TRANSPORT_LEFT = 8.3;
export const TRANSPORT_TOP = 12;
export const TRANSPORT_SCALE = 1.15;
export const MASTER_KNOB_SCALE = 1.25;
export const TRANSPORT_POSITIONS = { stop: 43.7, loop: 93.7, name: 135.7, volume: 269.7 } as const;

/** Sound editor panel. The shared knobs and edit control live in its own strip. */
export class SoundCreationPanel extends Container {
  constructor(width: number, height: number, presetTextures: PresetTextures, controls: ControlMode = '2d') {
    super();
    this.addChild(new RaisedPanelFrame(width, height, 0x83609a));
    this.addChild(createTransport(controls));
    if (controls === '2d') this.addChild(createPresetGrid(presetTextures));
    const waveform = new WaveformDisplay(width - 11);
    waveform.position.set(8, 139.7);
    this.addChild(waveform);
  }
}

function createTransport(controls: ControlMode): Container {
  const row = new Container();
  row.position.set(TRANSPORT_LEFT, TRANSPORT_TOP);
  const namePlate = createSoundName(118);
  namePlate.position.x = TRANSPORT_POSITIONS.name;
  row.addChild(namePlate);
  if (controls === '2d') {
    const play = new PixelButton('▶', 'pink');
    const stop = new PixelButton('■', 'cream');
    const loop = new PixelButton('↻', 'green');
    play.scale.set(TRANSPORT_SCALE);
    stop.scale.set(TRANSPORT_SCALE);
    loop.scale.set(TRANSPORT_SCALE);
    play.position.y = 1.5;
    stop.position.set(TRANSPORT_POSITIONS.stop, 1.5);
    loop.position.set(TRANSPORT_POSITIONS.loop, 1.5);
    const volume = new PixelKnob('VOL', 0.5, 0xff91c8, 'master');
    volume.scale.set(MASTER_KNOB_SCALE);
    volume.position.set(TRANSPORT_POSITIONS.volume, -8);
    row.addChild(play, stop, loop, volume);
  } else {
    // The 3D scene places the master rotor; only its board markings stay flat.
    const markings = new KnobMarkings('VOL', 0xff91c8, 'master');
    markings.scale.set(MASTER_KNOB_SCALE);
    markings.position.set(TRANSPORT_POSITIONS.volume, -8);
    row.addChild(markings);
  }
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
  PRESET_ICONS.forEach((icon, index) => {
    const column = index % 6;
    const row = Math.floor(index / 6);
    const pad = new PresetPad(icon, presetTextures, index === 0);
    pad.position.set(8.3 + column * PAD_STEP_X, 54 + row * PAD_STEP_Y);
    grid.addChild(pad);
  });
  return grid;
}
