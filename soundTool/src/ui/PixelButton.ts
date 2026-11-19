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
  const step = Math.min(2, cut / 2);
  const right = x + width;
  const bottom = y + height;
  graphic
    .moveTo(x + cut, y)
    .lineTo(right - cut, y)
    .lineTo(right - cut, y + step)
    .lineTo(right - cut + step, y + step)
    .lineTo(right - cut + step, y + 2 * step)
    .lineTo(right - step, y + 2 * step)
    .lineTo(right - step, y + cut)
    .lineTo(right, y + cut)
    .lineTo(right, bottom - cut)
    .lineTo(right - step, bottom - cut)
    .lineTo(right - step, bottom - 2 * step)
    .lineTo(right - cut + step, bottom - 2 * step)
    .lineTo(right - cut + step, bottom - step)
    .lineTo(right - cut, bottom - step)
    .lineTo(right - cut, bottom)
    .lineTo(x + cut, bottom)
    .lineTo(x + cut, bottom - step)
    .lineTo(x + cut - step, bottom - step)
    .lineTo(x + cut - step, bottom - 2 * step)
    .lineTo(x + step, bottom - 2 * step)
    .lineTo(x + step, bottom - cut)
    .lineTo(x, bottom - cut)
    .lineTo(x, y + cut)
    .lineTo(x + step, y + cut)
    .lineTo(x + step, y + 2 * step)
    .lineTo(x + cut - step, y + 2 * step)
    .lineTo(x + cut - step, y + step)
    .lineTo(x + cut, y + step)
    .closePath()
    .fill(color);
}

function createTransportIcon(icon: string): Graphics {
  const graphic = new Graphics();
  if (icon === '▶') {
    graphic
      .poly([5, 3, 22, 13, 22, 16, 5, 26]).fill(0x281735)
      .poly([4, 2, 21, 12, 21, 15, 4, 25]).fill(0x6c3150)
      .poly([5, 3, 19, 12, 19, 15, 5, 23]).fill(0xffae42)
      .poly([6, 5, 17, 12, 17, 15, 6, 21]).fill(0xffdb59)
      .rect(5, 4, 3, 15).fill(0xfff0a1)
      .rect(8, 6, 2, 3).fill(0xfff0a1);
  } else if (icon === '■') {
    graphic
      .rect(6, 6, 18, 18).fill(0x281735)
      .rect(6, 6, 16, 16).fill(0x604477)
      .rect(8, 8, 12, 12).fill(0xfff4dc)
      .rect(10, 10, 8, 8).fill(0x321b47)
      .rect(8, 8, 3, 2).fill(0xfffdf4)
      .rect(8, 10, 2, 3).fill(0xfffdf4)
      .rect(20, 9, 2, 11).fill(0x9f898b)
      .rect(10, 20, 10, 2).fill(0xb19b9a);
  } else {
    graphic
      .arc(14, 14, 8, -2.7, 0.1).stroke({ color: 0x281735, width: 5 })
      .arc(14, 14, 8, 0.45, 3.25).stroke({ color: 0x281735, width: 5 })
      .arc(14, 14, 8, -2.7, 0.1).stroke({ color: 0xfff4dc, width: 2 })
      .arc(14, 14, 8, 0.45, 3.25).stroke({ color: 0xfff4dc, width: 2 })
      .poly([19, 11, 25, 15, 20, 19]).fill(0x281735)
      .poly([19, 12, 23, 15, 20, 18]).fill(0xfff4dc)
      .poly([9, 9, 3, 13, 8, 17]).fill(0x281735)
      .poly([8, 10, 5, 13, 8, 16]).fill(0xfff4dc);
  }
  const iconScale = 0.9;
  graphic.scale.set(iconScale);
  graphic.position.set((BUTTON_SIZE - FACE_SIZE * iconScale) / 2, (BUTTON_SIZE - FACE_SIZE * iconScale) / 2);
  return graphic;
}

function createTextIcon(icon: string, color: number): Text {
  const isRun = icon === 'RUN';
  const label = new Text({
    text: icon,
    style: { fontFamily: 'monogram', fontSize: isRun ? 12 : 18, fontWeight: 'bold', fill: color }, resolution: 3,
  });
  label.anchor.set(0.5);
  label.position.set(BUTTON_SIZE / 2, BUTTON_SIZE / 2 - (isRun ? 2 : 3));
  return label;
}
