import { Container, Graphics, Text } from 'pixi.js';

const EDIT_WIDTH = 56;
const EDIT_HEIGHT = 36;
const EDGE_STEP = 4;

/** Wide stepped waveform-edit button with a beveled face and built-in label. */
export class EditButton extends Container {
  constructor() {
    super();
    this.addChild(drawEditFace());
    this.addChild(drawWaveformMark());
    this.addChild(createLabel());
  }
}

function drawEditFace(): Graphics {
  const face = new Graphics();
  drawChamfer(face, 3, 4, EDIT_WIDTH, EDIT_HEIGHT, EDGE_STEP, 0x170d21);
  drawChamfer(face, 0, 0, EDIT_WIDTH, EDIT_HEIGHT, EDGE_STEP, 0x24152e);
  drawChamfer(face, 2, 2, EDIT_WIDTH - 4, EDIT_HEIGHT - 4, EDGE_STEP - 1, 0x9c67b5);
  drawChamfer(face, 4, 4, EDIT_WIDTH - 8, EDIT_HEIGHT - 8, EDGE_STEP - 2, 0x59316f);
  face
    .rect(8, 4, EDIT_WIDTH - 16, 2).fill(0xe7b4f0)
    .rect(4, 8, 2, EDIT_HEIGHT - 16).fill(0xe7b4f0)
    .rect(EDIT_WIDTH - 6, 8, 2, EDIT_HEIGHT - 16).fill(0x332047)
    .rect(8, EDIT_HEIGHT - 6, EDIT_WIDTH - 16, 2).fill(0x332047);
  return face;
}

function drawChamfer(graphic: Graphics, x: number, y: number, width: number, height: number, cut: number, color: number): void {
  const right = x + width;
  const bottom = y + height;
  graphic
    .moveTo(x + cut, y).lineTo(right - cut, y)
    .lineTo(right - cut, y + 2).lineTo(right - 2, y + 2)
    .lineTo(right - 2, y + cut).lineTo(right, y + cut)
    .lineTo(right, bottom - cut).lineTo(right - 2, bottom - cut)
    .lineTo(right - 2, bottom - 2).lineTo(right - cut, bottom - 2)
    .lineTo(right - cut, bottom).lineTo(x + cut, bottom)
    .lineTo(x + cut, bottom - 2).lineTo(x + 2, bottom - 2)
    .lineTo(x + 2, bottom - cut).lineTo(x, bottom - cut)
    .lineTo(x, y + cut).lineTo(x + 2, y + cut)
    .lineTo(x + 2, y + 2).lineTo(x + cut, y + 2)
    .closePath().fill(color);
}

function drawWaveformMark(): Graphics {
  const wave = new Graphics();
  wave
    .moveTo(8, 14).lineTo(16, 14).lineTo(21, 8).lineTo(25, 21)
    .lineTo(31, 10).lineTo(36, 19).lineTo(42, 11).lineTo(48, 16)
    .stroke({ color: 0x3a2046, width: 5, cap: 'square', join: 'miter' })
    .moveTo(8, 12).lineTo(16, 12).lineTo(21, 6).lineTo(25, 19)
    .lineTo(31, 8).lineTo(36, 17).lineTo(42, 9).lineTo(48, 14)
    .stroke({ color: 0xffcf72, width: 3, cap: 'square', join: 'miter' })
    .moveTo(9, 11).lineTo(16, 11).lineTo(21, 6).lineTo(24, 15)
    .stroke({ color: 0xffe5a0, width: 1, cap: 'square', join: 'miter' });
  return wave;
}

function createLabel(): Text {
  const label = new Text({
    text: 'EDIT',
    style: { fontFamily: 'monogram', fontSize: 9, fontWeight: 'bold', fill: 0xffcf72 }, resolution: 3,
  });
  label.anchor.set(0.5, 0);
  label.position.set(EDIT_WIDTH / 2, 25);
  return label;
}
