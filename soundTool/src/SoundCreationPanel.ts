import { Container, Graphics, Text } from 'pixi.js';

const COLORS = {
  panel: 0x3e2455,
  panelDeep: 0x29173a,
  border: 0xb875d0,
  highlight: 0xe3a1ef,
  text: 0xffeaff,
  muted: 0xb88acb,
  yellow: 0xffcf72,
  pink: 0xff91c8,
  orange: 0xff985f,
};

/** Self-contained sound creation surface with transport, presets, waveform, and controls. */
export class SoundCreationPanel extends Container {
  constructor(width: number, height: number) {
    super();
    this.addChild(createPanel(width, height));
    this.addChild(createTitle());
    this.addChild(createTransport());
    this.addChild(createSoundPresets());
    this.addChild(createWaveform());
    this.addChild(createControlStrip());
  }
}

function createPanel(width: number, height: number): Graphics {
  return new Graphics()
    .roundRect(0, 0, width, height, 4)
    .fill(COLORS.panelDeep)
    .roundRect(0.5, 0.5, width - 1, height - 1, 4)
    .stroke({ color: COLORS.border, width: 1 })
    .moveTo(1, 19)
    .lineTo(width - 1, 19)
    .stroke({ color: 0x70428a, width: 1 });
}

function createTitle(): Text {
  const label = makeText('SOUND CREATION', 8, COLORS.text, true);
  label.position.set(7, 5);
  return label;
}

function createTransport(): Container {
  const controls = new Container();
  const play = makeButton(0, 22, 22, 22, 0xe84f91, '▶', COLORS.text);
  const stop = makeButton(25, 22, 22, 22, 0xe4aa54, '■', 0x3a2347);
  const loop = makeButton(50, 22, 22, 22, 0x7c5ad1, '↻', COLORS.text);
  controls.addChild(play, stop, loop);

  const nameField = new Graphics()
    .roundRect(76, 22, 127, 22, 3)
    .fill(0x21142f)
    .roundRect(76.5, 22.5, 126, 21, 3)
    .stroke({ color: 0x9867b5, width: 1 });
  const name = makeText('coin_pickup', 9, COLORS.text, true);
  name.position.set(83, 28);
  controls.addChild(nameField, name);

  const meter = new Graphics().rect(76, 45, 127, 2).fill(0x57356e);
  meter.rect(76, 45, 79, 2).fill(COLORS.yellow);
  controls.addChild(meter);
  return controls;
}

function createSoundPresets(): Container {
  const presets = new Container();
  const sounds = [
    { label: 'COIN', color: 0xffcf72, mark: '○' },
    { label: 'JUMP', color: 0xff91c8, mark: '↑' },
    { label: 'HEART', color: 0xff819f, mark: '♥' },
    { label: 'LASER', color: 0x8abaff, mark: '✦' },
    { label: 'POTION', color: 0xc7a1ef, mark: '!' },
    { label: 'BOOM', color: 0xff985f, mark: '✹' },
  ];
  const buttonWidth = 62;
  const buttonHeight = 21;
  const gapX = 6;
  const startX = 7;
  const startY = 53;

  sounds.forEach((sound, index) => {
    const column = index % 3;
    const row = Math.floor(index / 3);
    const x = startX + column * (buttonWidth + gapX);
    const y = startY + row * 25;
    const pad = new Graphics()
      .roundRect(x, y, buttonWidth, buttonHeight, 3)
      .fill(sound.color)
      .roundRect(x, y, buttonWidth, buttonHeight, 3)
      .stroke({ color: 0x251534, width: 2 })
      .moveTo(x + 3, y + 3)
      .lineTo(x + buttonWidth - 4, y + 3)
      .stroke({ color: 0xfff0c4, width: 1, alpha: 0.8 });
    const icon = makeText(sound.mark, 12, 0x392044, true);
    icon.position.set(x + 5, y + 3);
    const label = makeText(sound.label, 7, 0x392044, true);
    label.position.set(x + 22, y + 7);
    presets.addChild(pad, icon, label);
  });
  return presets;
}

function createWaveform(): Container {
  const waveform = new Container();
  const x = 7;
  const y = 108;
  const width = 204;
  const height = 43;
  const frame = new Graphics()
    .roundRect(x, y, width, height, 3)
    .fill(0x241530)
    .roundRect(x + 0.5, y + 0.5, width - 1, height - 1, 3)
    .stroke({ color: 0x9260ad, width: 1 });
  waveform.addChild(frame);

  const centerY = y + height - 5;
  const bars = [22, 31, 18, 24, 16, 20, 12, 23, 30, 17, 21, 14, 18, 11, 15, 9, 13, 18, 10, 7, 12, 6, 9, 5];
  const barWidth = 5;
  const gap = 2;
  const graphic = new Graphics();
  bars.forEach((barHeight, index) => {
    const barX = x + 5 + index * (barWidth + gap);
    graphic.rect(barX, centerY - barHeight, barWidth, barHeight)
      .fill(index < 17 ? COLORS.yellow : COLORS.orange);
  });
  graphic.moveTo(x + 4, centerY + 1).lineTo(x + width - 4, centerY + 1)
    .stroke({ color: 0x6f477e, width: 1 });
  waveform.addChild(graphic);

  const caption = makeText('WAVEFORM', 6, COLORS.muted, true);
  caption.position.set(x + 5, y + 3);
  waveform.addChild(caption);
  return waveform;
}

function createControlStrip(): Container {
  const strip = new Container();
  const controls = [
    { name: 'VOL', value: 0.74, color: COLORS.pink },
    { name: 'PAN', value: 0.47, color: COLORS.yellow },
    { name: 'DECAY', value: 0.66, color: COLORS.yellow },
    { name: 'PITCH', value: 0.58, color: 0x9ee18b },
  ];
  const cellWidth = 48;
  controls.forEach((control, index) => {
    const x = 7 + index * 51;
    const dial = new Graphics()
      .circle(x + 12, 165, 7)
      .fill(0x28173a)
      .circle(x + 12, 165, 7)
      .stroke({ color: 0xa877c1, width: 1 });
    const angle = Math.PI * 0.75 + control.value * Math.PI * 1.5;
    dial.moveTo(x + 12, 165)
      .lineTo(x + 12 + Math.cos(angle) * 5, 165 + Math.sin(angle) * 5)
      .stroke({ color: control.color, width: 2 });
    const label = makeText(control.name, 6, COLORS.text, true);
    label.position.set(x + 1, 176);
    const track = new Graphics()
      .roundRect(x, 187, cellWidth - 5, 4, 2)
      .fill(0x21142f)
      .roundRect(x, 187, (cellWidth - 5) * control.value, 4, 2)
      .fill(control.color);
    strip.addChild(dial, label, track);
  });
  return strip;
}

function makeButton(x: number, y: number, width: number, height: number, color: number, mark: string, textColor: number): Container {
  const button = new Container();
  const face = new Graphics()
    .roundRect(x, y, width, height, 3)
    .fill(color)
    .roundRect(x, y, width, height, 3)
    .stroke({ color: 0x281737, width: 2 })
    .moveTo(x + 4, y + 3)
    .lineTo(x + width - 5, y + 3)
    .stroke({ color: 0xffe6c2, width: 1, alpha: 0.8 });
  const glyph = makeText(mark, 11, textColor, true);
  glyph.anchor.set(0.5);
  glyph.position.set(x + width / 2, y + height / 2 + 1);
  button.addChild(face, glyph);
  return button;
}

function makeText(value: string, size: number, color: number, bold = false): Text {
  return new Text({
    text: value,
    style: {
      fontFamily: 'monospace',
      fontSize: size,
      fontWeight: bold ? 'bold' : 'normal',
      fill: color,
    },
  });
}
