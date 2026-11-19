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
  const outer = 0x24152e;
  const rim = selected ? 0xe95186 : 0x9f542d;
  const face = selected ? 0xf3ad58 : 0xf2b94c;
  drawChamfer(graphic, 0, 0, PAD_WIDTH, PAD_HEIGHT, PAD_CORNER, outer);
  drawChamfer(graphic, 2, 2, PAD_WIDTH - 2, PAD_HEIGHT - 2, 3, 0x432649);
  drawChamfer(graphic, 2, 2, PAD_WIDTH - 4, PAD_HEIGHT - 4, 2, rim);
  drawChamfer(graphic, 4, 4, PAD_WIDTH - 8, PAD_HEIGHT - 8, 2, face);
  graphic
    .rect(8, 5, PAD_WIDTH - 16, 1).fill(selected ? 0xffb6cc : 0xffdc7d)
    .rect(5, 8, 1, PAD_HEIGHT - 16).fill(selected ? 0xffb6cc : 0xffdc7d)
    .rect(PAD_WIDTH - 6, 8, 1, PAD_HEIGHT - 16).fill(0xc87336)
    .rect(8, PAD_HEIGHT - 6, PAD_WIDTH - 16, 1).fill(0xc87336);
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
