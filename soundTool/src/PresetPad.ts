import { Container, Graphics, Sprite, type Texture } from 'pixi.js';

export const PRESET_ICONS = [
  'coin', 'star', 'heart', 'gem', 'potion', 'chest',
  'boot', 'bomb', 'burst', 'sparkle', 'bell', 'skull',
] as const;

export type PresetIcon = typeof PRESET_ICONS[number];
export type PresetTextures = Record<PresetIcon, Texture>;

const PAD_WIDTH = 46;
const PAD_HEIGHT = 38;
const ICON_SIZE = 24;
const PAD_CORNER = 4;

/** Pixel-art preset tile with a stepped rim, crisp highlights, and a sprite face. */
export class PresetPad extends Container {
  constructor(icon: PresetIcon, textures: PresetTextures, selected = false) {
    super();
    this.addChild(drawPadFace(selected));
    const sprite = new Sprite(textures[icon]);
    sprite.width = ICON_SIZE;
    sprite.height = ICON_SIZE;
    sprite.position.set((PAD_WIDTH - ICON_SIZE) / 2, (PAD_HEIGHT - ICON_SIZE) / 2);
    this.addChild(sprite);
  }
}

function drawPadFace(selected: boolean): Graphics {
  const face = new Graphics();
  const edge = selected ? 0x291537 : 0x24152e;
  const rim = selected ? 0xe95186 : 0x8f4b35;
  const topLight = selected ? 0xffbed5 : 0xffdf8a;
  const faceColor = selected ? 0xf3ad58 : 0xf2b94c;
  const shadow = selected ? 0x5d284d : 0x311a36;

  drawChamfer(face, 2, 3, PAD_WIDTH, PAD_HEIGHT, PAD_CORNER, shadow);
  drawChamfer(face, 0, 0, PAD_WIDTH, PAD_HEIGHT, PAD_CORNER, edge);
  drawChamfer(face, 2, 2, PAD_WIDTH - 4, PAD_HEIGHT - 4, PAD_CORNER - 1, rim);
  drawChamfer(face, 4, 4, PAD_WIDTH - 8, PAD_HEIGHT - 8, 3, faceColor);
  drawChamfer(face, 5, 5, PAD_WIDTH - 12, PAD_HEIGHT - 12, 2, selected ? 0xffcf72 : 0xf8ca5e);
  face
    .rect(9, 5, PAD_WIDTH - 18, 2).fill(topLight)
    .rect(5, 9, 2, PAD_HEIGHT - 18).fill(topLight)
    .rect(PAD_WIDTH - 7, 9, 2, PAD_HEIGHT - 18).fill(selected ? 0xc34c72 : 0xb56537)
    .rect(9, PAD_HEIGHT - 7, PAD_WIDTH - 18, 2).fill(selected ? 0x713452 : 0xa64e34)
    .rect(7, PAD_HEIGHT - 4, 3, 2).fill(edge)
    .rect(PAD_WIDTH - 10, PAD_HEIGHT - 4, 3, 2).fill(edge);
  return face;
}

function drawChamfer(graphic: Graphics, x: number, y: number, width: number, height: number, cut: number, color: number): void {
  const step = Math.min(2, Math.floor(cut / 2));
  const right = x + width;
  const bottom = y + height;
  graphic
    .moveTo(x + cut, y)
    .lineTo(right - cut, y)
    .lineTo(right - cut, y + step)
    .lineTo(right - step, y + step)
    .lineTo(right - step, y + cut)
    .lineTo(right, y + cut)
    .lineTo(right, bottom - cut)
    .lineTo(right - step, bottom - cut)
    .lineTo(right - step, bottom - step)
    .lineTo(right - cut, bottom - step)
    .lineTo(right - cut, bottom)
    .lineTo(x + cut, bottom)
    .lineTo(x + cut, bottom - step)
    .lineTo(x + step, bottom - step)
    .lineTo(x + step, bottom - cut)
    .lineTo(x, bottom - cut)
    .lineTo(x, y + cut)
    .lineTo(x + step, y + cut)
    .lineTo(x + step, y + step)
    .lineTo(x + cut, y + step)
    .closePath()
    .fill(color);
}
