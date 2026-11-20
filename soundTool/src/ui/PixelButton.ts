import { Container, Graphics, Text } from 'pixi.js';
import { drawGradientFace } from './GradientFace';
import { makePressable } from './Pressable';

export type ButtonTone = 'pink' | 'gold' | 'violet' | 'purple' | 'dark' | 'green' | 'cream';

export const BUTTON_SIZE = 32;
const FACE_SIZE = 28;
const CORNER_RADIUS = 4;

export const BUTTON_TONES: Record<ButtonTone, { top: number; mid: number; bottom: number; text: number }> = {
  pink: { top: 0xfff0f4, mid: 0xfe7da4, bottom: 0xd8598a, text: 0xfff1f8 },
  gold: { top: 0xfff2cc, mid: 0xfcc358, bottom: 0xe8a83c, text: 0x392044 },
  violet: { top: 0xd8b8ec, mid: 0x9a6cc8, bottom: 0x7a53a8, text: 0xfff1f8 },
  purple: { top: 0xcaa2e0, mid: 0x8b5cb0, bottom: 0x6d4499, text: 0xffeaff },
  dark: { top: 0x755383, mid: 0x4a3260, bottom: 0x3a2450, text: 0xffeaff },
  green: { top: 0xe8f8c8, mid: 0xa8d860, bottom: 0xd8d858, text: 0x203323 },
  cream: { top: 0xffffff, mid: 0xfdeed1, bottom: 0xe8dcc0, text: 0x392044 },
};


/**
 * Flat [x, y, ...] points of a crescent band: the outer arc from a0 to a1
 * (degrees, 0 = +x, positive clockwise in screen space), then the inner arc
 * back. Values round to 0.1 so the pixel-art silhouette stays stable.
 */
function crescentPoints(cx: number, cy: number, rOut: number, rIn: number, a0: number, a1: number): number[] {
  const round1 = (v: number): number => Math.round(v * 10) / 10;
  const point = (r: number, a: number): number[] => [
    round1(cx + r * Math.cos((a * Math.PI) / 180)),
    round1(cy + r * Math.sin((a * Math.PI) / 180)),
  ];
  const pts: number[] = [];
  const step = 10;
  for (let a = a0; a < a1; a += step) pts.push(...point(rOut, a));
  pts.push(...point(rOut, a1));
  for (let a = a1; a > a0; a -= step) pts.push(...point(rIn, a));
  pts.push(...point(rIn, a0));
  return pts;
}

/**
 * Rounded pixel-art button for transport and other controls. Defaults to a
 * fixed 32×32 box with a 28×28 face; pass width/height for a full-size face
 * that matches the preset pads.
 */
export class PixelButton extends Container {
  constructor(icon: string, tone: ButtonTone = 'purple', selected = false, width = BUTTON_SIZE, height = BUTTON_SIZE) {
    super();
    const colors = BUTTON_TONES[tone];
    this.addChild(createButtonFace(colors, selected, width, height));
    if (icon === '▶' || icon === '■' || icon === '↻') {
      this.addChild(createTransportIcon(icon, width, height));
    } else {
      this.addChild(createTextIcon(icon, colors.text, width, height));
    }
    makePressable(this);
  }
}

function createButtonFace(colors: (typeof BUTTON_TONES)[ButtonTone], selected: boolean, width: number, height: number): Graphics {
  const face = new Graphics();
  const customSize = width !== BUTTON_SIZE || height !== BUTTON_SIZE;
  // Pad-sized buttons share the preset pads' edge tone and bevel profile.
  drawGradientFace(face, 0, 0, customSize ? width : FACE_SIZE, customSize ? height : FACE_SIZE, CORNER_RADIUS, {
    edge: customSize ? 0x24152e : 0x432851,
    top: selected ? 0xfff0bd : colors.top,
    mid: colors.mid,
    bottom: colors.bottom,
  }, customSize ? 0.68 : 0.6, 4);
  if (customSize) {
    face.rect(4, height - 3.5, width - 8, 1).fill(mix(colors.bottom, 0x24152e, 0.4));
  }
  return face;
}

function mix(a: number, b: number, t: number): number {
  const ar = (a >> 16) & 255, ag = (a >> 8) & 255, ab = a & 255;
  const br = (b >> 16) & 255, bg = (b >> 8) & 255, bb = b & 255;
  const r = Math.round(ar + (br - ar) * t), g = Math.round(ag + (bg - ag) * t), bl = Math.round(ab + (bb - ab) * t);
  return (r << 16) | (g << 8) | bl;
}

function createTransportIcon(icon: string, width: number, height: number): Graphics {
  const graphic = new Graphics();
  const customSize = width !== BUTTON_SIZE || height !== BUTTON_SIZE;
  let contentScale = 1;
  if (icon === '▶') {
    graphic
      .poly([5, 3, 22, 13, 22, 16, 5, 26]).fill(0x281735)
      .poly([4, 2, 21, 12, 21, 15, 4, 25]).fill(0x6c3150)
      .poly([5, 3, 19, 12, 19, 15, 5, 23]).fill(0xffae42)
      .poly([6, 5, 17, 12, 17, 15, 6, 21]).fill(0xffdb59)
      .rect(5, 4, 3, 15).fill(0xfff0a1)
      .rect(8, 6, 2, 3).fill(0xfff0a1);
  } else if (icon === '■') {
    // Stop square sized to match the play triangle's visual weight.
    graphic
      .rect(5, 5, 18, 18).fill(0x281735)
      .rect(6, 6, 16, 16).fill(0x39204f)
      .rect(6, 6, 16, 2).fill(0x54327a);
    contentScale = 1.05;
  } else {
    // Reference loop icon: two stacked curved arrows, each a crescent band that
    // ends in a small block head (top arrow points right, bottom is its 180-degree
    // rotation). Single filled silhouettes only - no strokes, no overlaps.
    const cx = 14;
    const cyTop = 11.4;
    const cyMid = 14.2; // vertical center of the 28x28 icon, matching the reference gap
    const topDark = crescentPoints(cx, cyTop, 8.4, 2.3, 180, 360);
    const topCream = crescentPoints(cx, cyTop, 7.3, 3.4, 185, 355);
    const topHeadDark = [20.2, 8.0, 22.6, 8.8, 24.2, 11.4, 22.6, 14, 20.2, 14.8];
    const topHeadCream = [20.9, 9.3, 22.3, 9.9, 23.1, 11.4, 22.3, 12.9, 20.9, 13.5];
    const rotate180 = (pts: number[]): number[] =>
      pts.map((v, i) => (i % 2 === 0 ? 2 * cx - v : 2 * cyMid - v));
    graphic
      .poly(topDark).fill(0x281735)
      .poly(topHeadDark).fill(0x281735)
      .poly(rotate180(topDark)).fill(0x281735)
      .poly(rotate180(topHeadDark)).fill(0x281735)
      .poly(topCream).fill(0xfff4dc)
      .poly(topHeadCream).fill(0xfff4dc)
      .poly(rotate180(topCream)).fill(0xfff4dc)
      .poly(rotate180(topHeadCream)).fill(0xfff4dc);
    contentScale = 1.12;
  }
  // Icons are drawn in a 28×28 box: fill the default face, or the pad-size one.
  const iconScale = (customSize ? 30 / FACE_SIZE : 0.9) * contentScale;
  graphic.scale.set(iconScale);
  graphic.position.set((width - FACE_SIZE * iconScale) / 2, (height - FACE_SIZE * iconScale) / 2);
  return graphic;
}

function createTextIcon(icon: string, color: number, width: number, height: number): Text {
  const isRun = icon === 'RUN';
  const label = new Text({
    text: icon,
    style: { fontFamily: 'monogram', fontSize: isRun ? 12 : 18, fontWeight: 'bold', fill: color }, resolution: 3,
  });
  label.anchor.set(0.5);
  label.position.set(width / 2, height / 2 - (isRun ? 2 : 3));
  return label;
}
