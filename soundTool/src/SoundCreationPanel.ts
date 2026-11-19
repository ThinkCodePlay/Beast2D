import { Container, Graphics, Text } from 'pixi.js';
import { PresetPad, PRESET_ICONS, type PresetTextures } from './PresetPad';
import { PixelButton } from './ui/PixelButton';
import { PixelKnob } from './ui/PixelKnob';
import { RaisedPanelFrame } from './ui/RaisedPanelFrame';
import { WaveformDisplay } from './ui/WaveformDisplay';

const BUTTON_GAP = 8;
const PAD_STEP_X = 160 / 3; // 160 output pixels at the 3× stage scale.
const PAD_STEP_Y = 43;

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
  const namePlate = createSoundName(96);
  const volume = new PixelKnob('VOL', 0.5, 0xff91c8, 'master');
  volume.scale.set(1.25);
  stop.position.x = 32 + BUTTON_GAP;
  loop.position.x = 64 + BUTTON_GAP * 2;
  namePlate.position.x = 117;
  volume.position.set(268, -8);
  row.addChild(play, stop, loop, namePlate, volume);
  return row;
}

function createSoundName(width: number): Container {
  const plate = new Container();
  const face = new Graphics()
    .rect(0, 0, width, 32).fill(0x21142f)
    .rect(0, 0, width, 4).fill(0xe3a1ef)
    .rect(0, 28, width, 4).fill(0x281635)
    .rect(4, 4, width - 8, 24).stroke({ color: 0x9867b5, width: 2 });
  const name = new Text({
    text: 'coin_pickup',
    style: { fontFamily: 'monogram', fontSize: 14, fontWeight: 'bold', fill: 0xffeaff }, resolution: 3,
  });
  name.position.set(8, 12);
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
