import { Container, Graphics, Text } from 'pixi.js';

export type ButtonTone = 'pink' | 'gold' | 'violet' | 'purple' | 'dark' | 'green';

const BUTTON_SIZE = 32;
const BUTTON_FACE_SIZE = 28;

const toneColors: Record<ButtonTone, { face: number; text: number }> = {
  pink: { face: 0xe84f91, text: 0xfff1f8 },
  gold: { face: 0xe4aa54, text: 0x392044 },
  violet: { face: 0x7c5ad1, text: 0xfff1f8 },
  purple: { face: 0x724492, text: 0xffeaff },
  dark: { face: 0x35243f, text: 0xffeaff },
  green: { face: 0x63b65a, text: 0x203323 },
};

/** Fixed 32×32 pixel-art button for transport, tabs, and other controls. */
export class PixelButton extends Container {
  constructor(icon: string, tone: ButtonTone = 'purple', selected = false) {
    super();
    const colors = toneColors[tone];
    this.addChild(createButtonFace(colors.face, tone, selected));
    this.addChild(createIcon(icon, colors.text));
  }
}

function createButtonFace(color: number, tone: ButtonTone, selected: boolean): Graphics {
  const edge = selected ? 0xffcf72 : tone === 'dark' ? 0x1b1027 : 0x281737;
  return new Graphics()
    .rect(4, 4, BUTTON_FACE_SIZE, BUTTON_FACE_SIZE)
    .fill(0x140b20)
    .rect(0, 0, BUTTON_FACE_SIZE, BUTTON_FACE_SIZE)
    .fill(color)
    .rect(4, 2, BUTTON_FACE_SIZE - 8, 2)
    .fill(0xffe6c2)
    .rect(2, 4, 2, BUTTON_FACE_SIZE - 8)
    .fill(0xffe6c2)
    .rect(BUTTON_FACE_SIZE - 2, 4, 2, BUTTON_FACE_SIZE - 8)
    .fill(edge)
    .rect(4, BUTTON_FACE_SIZE - 2, BUTTON_FACE_SIZE - 8, 2)
    .fill(edge)
    .rect(2, 2, 4, 4)
    .fill(selected ? 0xfff0c4 : 0xffcf9a)
    .rect(BUTTON_SIZE - 8, BUTTON_SIZE - 8, 4, 4)
    .fill(0x291537);
}

function createIcon(icon: string, color: number): Text {
  const label = new Text({
    text: icon,
    style: { fontFamily: 'monogram', fontSize: 20, fontWeight: 'bold', fill: color }, resolution: 3,
  });
  label.anchor.set(0.5);
  label.position.set(BUTTON_SIZE / 2, BUTTON_SIZE / 2 - 2);
  return label;
}
