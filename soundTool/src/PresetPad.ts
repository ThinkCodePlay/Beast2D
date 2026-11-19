import { Container, Graphics, Sprite, type Texture } from 'pixi.js';

export const PRESET_ICONS = [
  'coin', 'star', 'heart', 'gem', 'potion', 'chest',
  'boot', 'bomb', 'burst', 'sparkle', 'bell', 'skull',
] as const;

export type PresetIcon = typeof PRESET_ICONS[number];
export type PresetTextures = Record<PresetIcon, Texture>;

const PAD_WIDTH = 48;
const PAD_HEIGHT = 38;
const ICON_SIZE = 24;

/** Pixel-art sound preset tile with a separately authored sprite. */
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
  const face = selected ? 0xe95186 : 0xf6c355;
  const side = selected ? 0x9e345f : 0xb86538;
  return new Graphics()
    .rect(4, 4, PAD_WIDTH - 4, PAD_HEIGHT - 4).fill(0x241431)
    .rect(0, 0, PAD_WIDTH - 4, PAD_HEIGHT - 4).fill(0x432649)
    .rect(2, 2, PAD_WIDTH - 8, PAD_HEIGHT - 8).fill(face)
    .rect(4, 4, PAD_WIDTH - 12, PAD_HEIGHT - 12).fill(face)
    .rect(4, 3, PAD_WIDTH - 12, 2).fill(selected ? 0xffa6bf : 0xffefb5)
    .rect(3, 5, 2, PAD_HEIGHT - 15).fill(selected ? 0xffa6bf : 0xffefb5)
    .rect(PAD_WIDTH - 10, 5, 2, PAD_HEIGHT - 15).fill(side)
    .rect(5, PAD_HEIGHT - 10, PAD_WIDTH - 15, 2).fill(side)
    .rect(PAD_WIDTH - 12, PAD_HEIGHT - 12, 4, 4).fill(0x301a3b);
}
