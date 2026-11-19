import { Container, Graphics, Text } from 'pixi.js';
import { PresetPad, type PresetIcon } from './PresetPad';
import { PixelButton } from './ui/PixelButton';
import { PixelKnob } from './ui/PixelKnob';
import { RaisedPanelFrame } from './ui/RaisedPanelFrame';
import { WaveformDisplay } from './ui/WaveformDisplay';

const BUTTON_GAP = 8;
const PAD_STEP_X = 52;
const PAD_STEP_Y = 44;
const PRESETS: PresetIcon[] = [
  'coin', 'star', 'heart', 'gem', 'potion', 'chest',
  'boot', 'bomb', 'burst', 'sparkle', 'bell', 'skull',
];

/** Sound editor panel. The shared knobs and edit control live in its own strip. */
export class SoundCreationPanel extends Container {
  constructor(width: number, height: number) {
    super();
    this.addChild(new RaisedPanelFrame(width, height));
    this.addChild(createTransport());
    this.addChild(createPresetGrid());
    const waveform = new WaveformDisplay(width - 32);
    waveform.position.set(16, 140);
    this.addChild(waveform);
  }
}

function createTransport(): Container {
  const row = new Container();
  row.position.set(16, 16);
  const play = new PixelButton('▶', 'pink');
  const stop = new PixelButton('■', 'dark');
  const loop = new PixelButton('↻', 'green');
  const namePlate = createSoundName(96);
  const volume = new PixelKnob('VOL', 0.75, 0xff91c8, 'master');
  volume.scale.set(1.25);
  stop.position.x = 32 + BUTTON_GAP;
  loop.position.x = 64 + BUTTON_GAP * 2;
  namePlate.position.x = 96 + BUTTON_GAP * 3;
  volume.position.set(224, -8);
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
    style: { fontFamily: 'monogram', fontSize: 12, fontWeight: 'bold', fill: 0xffeaff }, resolution: 3,
  });
  name.position.set(8, 12);
  plate.addChild(face, name);
  return plate;
}

function createPresetGrid(): Container {
  const grid = new Container();
  PRESETS.forEach((icon, index) => {
    const column = index % 6;
    const row = Math.floor(index / 6);
    const pad = new PresetPad(icon, index === 0);
    pad.position.set(8 + column * PAD_STEP_X, 56 + row * PAD_STEP_Y);
    grid.addChild(pad);
  });
  return grid;
}
