import { Container, Graphics, Text } from 'pixi.js';

export type ButtonTone = 'pink' | 'gold' | 'violet' | 'purple' | 'dark' | 'green' | 'cream';

const BUTTON_SIZE = 32;
const FACE_SIZE = 28;
const CORNER = 4;

const toneColors: Record<ButtonTone, { face: number; light: number; shade: number; text: number }> = {
  pink: { face: 0xe94f88, light: 0xffa5bb, shade: 0xa93162, text: 0xfff1f8 },
  gold: { face: 0xf0bd50, light: 0xffe5a0, shade: 0xa96738, text: 0x392044 },
  violet: { face: 0x8357b8, light: 0xc58bdd, shade: 0x493064, text: 0xfff1f8 },
  purple: { face: 0x71448e, light: 0xb87dcb, shade: 0x3b2450, text: 0xffeaff },
  dark: { face: 0x392544, light: 0x755383, shade: 0x20132c, text: 0xffeaff },
  green: { face: 0x79b94d, light: 0xb7e277, shade: 0x426238, text: 0x203323 },
  cream: { face: 0xf6f0e3, light: 0xfffdf4, shade: 0xb19b9a, text: 0x392044 },
};

/** Fixed 32×32 chamfered pixel-art button for transport and other controls. */
export class PixelButton extends Container {
  constructor(icon: string, tone: ButtonTone = 'purple', selected = false) {
    super();
    const colors = toneColors[tone];
    this.addChild(createButtonFace(colors, selected));
    if (icon === '▶' || icon === '■' || icon === '↻') {
      this.addChild(createTransportIcon(icon));
    } else {
      this.addChild(createTextIcon(icon, colors.text));
    }
  }
}

function createButtonFace(colors: (typeof toneColors)[ButtonTone], selected: boolean): Graphics {
  const button = new Graphics();
  drawChamferedRect(button, 0, 0, FACE_SIZE, FACE_SIZE, CORNER, 0x432851);
  drawChamferedRect(button, 2, 2, FACE_SIZE - 4, FACE_SIZE - 4, 2, colors.face);
  button
    .rect(6, 4, FACE_SIZE - 12, 2).fill(selected ? 0xfff0bd : colors.light)
    .rect(4, 6, 2, FACE_SIZE - 12).fill(colors.light)
    .rect(FACE_SIZE - 4, 6, 2, FACE_SIZE - 12).fill(colors.shade)
    .rect(6, FACE_SIZE - 4, FACE_SIZE - 12, 2).fill(colors.shade)
    .rect(FACE_SIZE - 6, FACE_SIZE - 6, 2, 2).fill(0x291537);
  return button;
}

function drawChamferedRect(graphic: Graphics, x: number, y: number, width: number, height: number, cut: number, color: number): void {
  graphic
    .moveTo(x + cut, y)
    .lineTo(x + width - cut, y)
    .lineTo(x + width - cut, y + cut)
    .lineTo(x + width, y + cut)
    .lineTo(x + width, y + height - cut)
    .lineTo(x + width - cut, y + height - cut)
    .lineTo(x + width - cut, y + height)
    .lineTo(x + cut, y + height)
    .lineTo(x + cut, y + height - cut)
    .lineTo(x, y + height - cut)
    .lineTo(x, y + cut)
    .lineTo(x + cut, y + cut)
    .closePath()
    .fill(color);
}

function createTransportIcon(icon: string): Graphics {
  const graphic = new Graphics();
  if (icon === '▶') {
    graphic.poly([10, 8, 26, 16, 10, 24]).fill(0x47243f)
      .poly([8, 6, 24, 14, 8, 22]).fill(0x9f6233)
      .poly([8, 6, 22, 14, 8, 22]).fill(0xffc84d)
      .rect(8, 6, 3, 14).fill(0xffed9e);
  } else if (icon === '■') {
    graphic.rect(9, 9, 16, 16).fill(0x281735)
      .rect(9, 9, 14, 14).fill(0x472b54)
      .rect(11, 11, 10, 10).fill(0x321b47);
  } else {
    graphic.arc(16, 16, 7, -2.7, 0.1).stroke({ color: 0x3a2345, width: 5 })
      .arc(16, 16, 7, 0.45, 3.25).stroke({ color: 0x3a2345, width: 5 })
      .arc(16, 16, 7, -2.7, 0.1).stroke({ color: 0xfff4dc, width: 2.5 })
      .arc(16, 16, 7, 0.45, 3.25).stroke({ color: 0xfff4dc, width: 2.5 })
      .poly([22, 7, 27, 8, 24, 13]).fill(0x3a2345)
      .poly([22, 8, 25, 9, 23, 12]).fill(0xfff4dc)
      .poly([10, 25, 5, 24, 8, 19]).fill(0x3a2345)
      .poly([10, 24, 7, 23, 9, 20]).fill(0xfff4dc);
  }
  return graphic;
}

function createTextIcon(icon: string, color: number): Text {
  const isRun = icon === 'RUN';
  const label = new Text({
    text: icon,
    style: { fontFamily: 'monogram', fontSize: isRun ? 12 : 18, fontWeight: 'bold', fill: color }, resolution: 3,
  });
  label.anchor.set(0.5);
  label.position.set(BUTTON_SIZE / 2, BUTTON_SIZE / 2 - (isRun ? 0 : 1));
  return label;
}
