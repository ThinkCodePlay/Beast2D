import { Container, Graphics, Sprite, type Texture } from 'pixi.js';

export const PRESET_ICONS = [
  'coin', 'star', 'heart', 'gem', 'potion', 'chest',
  'boot', 'bomb', 'burst', 'sparkle', 'bell', 'skull',
] as const;

export type PresetIcon = typeof PRESET_ICONS[number];
export type PresetTextures = Record<PresetIcon, Texture>;

const PAD_WIDTH = 42;
const PAD_HEIGHT = 38;
const ICON_SIZE = 20;
const PAD_CORNER = 4;

/** Pixel-art preset tile with a thin stepped bevel and separate sprite. */
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
  const graphic = new Graphics();
  const border = selected ? 0xe95186 : 0x432649;
  const side = selected ? 0xb94368 : 0xb86538;
  drawChamfer(graphic, 0, 0, PAD_WIDTH, PAD_HEIGHT, PAD_CORNER, border);
  drawChamfer(graphic, 2, 2, PAD_WIDTH - 4, PAD_HEIGHT - 4, 2, 0xf6c355);
  graphic
    .rect(6, 3, PAD_WIDTH - 12, 2).fill(selected ? 0xffa6bf : 0xffefb5)
    .rect(3, 6, 2, PAD_HEIGHT - 12).fill(selected ? 0xffa6bf : 0xffefb5)
    .rect(PAD_WIDTH - 4, 6, 1, PAD_HEIGHT - 12).fill(side)
    .rect(6, PAD_HEIGHT - 4, PAD_WIDTH - 12, 1).fill(side);
  return graphic;
}

function drawChamfer(graphic: Graphics, x: number, y: number, width: number, height: number, cut: number, color: number): void {
  graphic
    .moveTo(x + cut, y).lineTo(x + width - cut, y)
    .lineTo(x + width - cut, y + cut).lineTo(x + width, y + cut)
    .lineTo(x + width, y + height - cut).lineTo(x + width - cut, y + height - cut)
    .lineTo(x + width - cut, y + height).lineTo(x + cut, y + height)
    .lineTo(x + cut, y + height - cut).lineTo(x, y + height - cut)
    .lineTo(x, y + cut).lineTo(x + cut, y + cut).closePath().fill(color);
}
