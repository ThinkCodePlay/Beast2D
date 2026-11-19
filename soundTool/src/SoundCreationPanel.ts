import { Container, Graphics, Text } from 'pixi.js';
import { PixelButton } from './ui/PixelButton';
import { PixelKnob } from './ui/PixelKnob';
import { RaisedPanelFrame } from './ui/RaisedPanelFrame';
import { WaveformDisplay } from './ui/WaveformDisplay';

const BUTTON_GAP = 8;
const PAD_STEP_X = 40;
const PAD_STEP_Y = 40;
const KNOB_STEP = 40;
const TITLE_COLOR = 0xffeaff;

const PRESETS = [
  { icon: '¢', tone: 'gold' },
  { icon: '★', tone: 'gold' },
  { icon: '♥', tone: 'pink' },
  { icon: '◆', tone: 'violet' },
  { icon: '!', tone: 'pink' },
  { icon: '□', tone: 'gold' },
  { icon: '⌁', tone: 'violet' },
  { icon: '●', tone: 'violet' },
  { icon: '✹', tone: 'pink' },
  { icon: '✦', tone: 'gold' },
  { icon: '♟', tone: 'gold' },
  { icon: '☠', tone: 'gold' },
] as const;

const KNOBS = [
  { label: 'VOL', value: 0.75, color: 0xff91c8 },
  { label: 'PAN', value: 0.5, color: 0xffcf72 },
  { label: 'DEC', value: 0.68, color: 0xffcf72 },
  { label: 'RATE', value: 0.58, color: 0xffcf72 },
  { label: 'PITCH', value: 0.62, color: 0x9ee18b },
  { label: 'CUT', value: 0.54, color: 0xffcf72 },
] as const;

/** Left-side sound maker. Each visual control is an independent 32px component. */
export class SoundCreationPanel extends Container {
  constructor(width: number, height: number) {
    super();
    this.addChild(new RaisedPanelFrame(width, height));
    this.addChild(createTitle());
    this.addChild(createTransport());
    this.addChild(createPresetGrid());
    const waveform = new WaveformDisplay(width - 32);
    waveform.position.set(16, 144);
    this.addChild(waveform);
    this.addChild(createKnobRow());
  }
}

function createTitle(): Text {
  const title = new Text({
    text: 'SOUND CREATION',
    style: { fontFamily: 'monospace', fontSize: 8, fontWeight: 'bold', fill: TITLE_COLOR },
  });
  title.position.set(16, 4);
  return title;
}

function createTransport(): Container {
  const row = new Container();
  row.position.set(16, 24);

  const play = new PixelButton('▶', 'pink');
  const stop = new PixelButton('■', 'gold');
  const loop = new PixelButton('↻', 'violet');
  const namePlate = createSoundName();
  const volume = new PixelKnob('VOL', 0.75, 0xff91c8);

  stop.position.x = 32 + BUTTON_GAP;
  loop.position.x = 64 + BUTTON_GAP * 2;
  namePlate.position.x = 96 + BUTTON_GAP * 3;
  volume.position.x = 192 + BUTTON_GAP * 4;
  row.addChild(play, stop, loop, namePlate, volume);
  return row;
}

function createSoundName(): Container {
  const plate = new Container();
  const face = new Graphics()
    .rect(0, 0, 96, 32)
    .fill(0x21142f)
    .rect(0, 0, 96, 4)
    .fill(0xe3a1ef)
    .rect(0, 28, 96, 4)
    .fill(0x281635)
    .rect(4, 4, 88, 24)
    .stroke({ color: 0x9867b5, width: 2 });
  const name = new Text({
    text: 'coin_pickup',
    style: { fontFamily: 'monospace', fontSize: 8, fontWeight: 'bold', fill: 0xffeaff },
  });
  name.position.set(8, 12);
  plate.addChild(face, name);
  return plate;
}

function createPresetGrid(): Container {
  const grid = new Container();
  const startX = 28;
  PRESETS.forEach((preset, index) => {
    const column = index % 6;
    const row = Math.floor(index / 6);
    const button = new PixelButton(preset.icon, preset.tone, index === 0);
    button.position.set(startX + column * PAD_STEP_X, 64 + row * PAD_STEP_Y);
    grid.addChild(button);
  });
  return grid;
}

function createKnobRow(): Container {
  const row = new Container();
  const startX = 28;
  KNOBS.forEach((knob, index) => {
    const control = new PixelKnob(knob.label, knob.value, knob.color);
    control.position.set(startX + index * KNOB_STEP, 160);
    row.addChild(control);
  });
  return row;
}
