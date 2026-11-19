import { Container, Graphics, Text } from 'pixi.js';

const EDIT_WIDTH = 56;
const EDIT_HEIGHT = 36;

/** Wide raised waveform-edit button with its label built into the face. */
export class EditButton extends Container {
  constructor() {
    super();
    this.addChild(drawEditFace());
    this.addChild(drawWaveformMark());
    this.addChild(createLabel());
  }
}

function drawEditFace(): Graphics {
  return new Graphics()
    .rect(4, 4, EDIT_WIDTH, EDIT_HEIGHT).fill(0x140b20)
    .rect(0, 0, EDIT_WIDTH, EDIT_HEIGHT).fill(0x724492)
    .rect(4, 2, EDIT_WIDTH - 8, 2).fill(0xe3a1ef)
    .rect(2, 4, 2, EDIT_HEIGHT - 8).fill(0xe3a1ef)
    .rect(EDIT_WIDTH - 2, 4, 2, EDIT_HEIGHT - 8).fill(0x36203f)
    .rect(4, EDIT_HEIGHT - 2, EDIT_WIDTH - 8, 2).fill(0x36203f);
}

function drawWaveformMark(): Graphics {
  return new Graphics()
    .moveTo(8, 13).lineTo(13, 13)
    .lineTo(17, 7).lineTo(21, 19)
    .lineTo(26, 10).lineTo(31, 17)
    .lineTo(36, 11).lineTo(41, 15)
    .lineTo(47, 13)
    .stroke({ color: 0xffcf72, width: 3, cap: 'square', join: 'miter' });
}

function createLabel(): Text {
  const label = new Text({
    text: 'EDIT',
    style: { fontFamily: 'monospace', fontSize: 7, fontWeight: 'bold', fill: 0xffcf72 },
  });
  label.anchor.set(0.5, 0);
  label.position.set(EDIT_WIDTH / 2, 25);
  return label;
}
