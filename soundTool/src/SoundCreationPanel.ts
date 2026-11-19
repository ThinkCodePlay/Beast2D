import { Container, Graphics, Text } from 'pixi.js';
import { PresetPad, PRESET_ICONS, type PresetTextures } from './PresetPad';
import { PixelButton } from './ui/PixelButton';
import { PixelKnob } from './ui/PixelKnob';
import { RaisedPanelFrame } from './ui/RaisedPanelFrame';
import { WaveformDisplay } from './ui/WaveformDisplay';

const PAD_STEP_X = 160 / 3; // 160 output pixels at the 3× stage scale.
const PAD_STEP_Y = 43;
const TRANSPORT_POSITIONS = { stop: 42, loop: 92, name: 134, volume: 268 } as const;

/** Sound editor panel. The shared knobs and edit control live in its own strip. */
export class SoundCreationPanel extends Container {
  constructor(width: number, height: number, presetTextures: PresetTextures) {
    super();
    this.addChild(new RaisedPanelFrame(width, height));
    this.addChild(createTransport());
    this.addChild(createPresetGrid(presetTextures));
    const waveform = new WaveformDisplay(width - 4);
    waveform.position.set(2, 136);
    this.addChild(waveform);
  }
}

function createTransport(): Container {
  const row = new Container();
  row.position.set(5, 8);
  const play = new PixelButton('▶', 'pink');
  const stop = new PixelButton('■', 'cream');
  const loop = new PixelButton('↻', 'green');
  play.scale.set(1.35);
  stop.scale.set(1.35);
  loop.scale.set(1.35);
  const namePlate = createSoundName(118);
  const volume = new PixelKnob('VOL', 0.5, 0xff91c8, 'master');
  volume.scale.set(1.25);
  stop.position.x = TRANSPORT_POSITIONS.stop;
  loop.position.x = TRANSPORT_POSITIONS.loop;
  namePlate.position.x = TRANSPORT_POSITIONS.name;
  volume.position.set(TRANSPORT_POSITIONS.volume, -8);
  row.addChild(play, stop, loop, namePlate, volume);
  return row;
}

function createSoundName(width: number): Container {
  const plate = new Container();
  const face = new Graphics()
    .poly([4, 0, width - 4, 0, width, 4, width, 28, width - 4, 32, 4, 32, 0, 28, 0, 4]).fill(0x24152e)
    .poly([6, 2, width - 6, 2, width - 2, 6, width - 2, 26, width - 6, 30, 6, 30, 2, 26, 2, 6]).fill(0x9b60b7)
    .poly([7, 4, width - 7, 4, width - 4, 7, width - 4, 25, width - 7, 28, 7, 28, 4, 25, 4, 7]).fill(0x291838)
    .rect(9, 5, width - 18, 1).fill(0xc58bdd)
    .rect(5, 9, 1, 14).fill(0xb77bcf)
    .rect(width - 6, 8, 1, 16).fill(0x1b1027)
    .rect(9, 27, width - 18, 1).fill(0x1b1027);
  const name = new Text({
    text: 'coin_pickup',
    style: { fontFamily: 'monogram', fontSize: 16, fontWeight: 'bold', fill: 0xffeaff }, resolution: 3,
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
    pad.position.set(3 + column * PAD_STEP_X, 54 + row * PAD_STEP_Y);
    grid.addChild(pad);
  });
  return grid;
}
