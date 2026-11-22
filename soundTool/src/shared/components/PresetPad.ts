import { Container, Graphics, Sprite, type Texture } from "pixi.js";
import { chamferPoints, drawGradientFace } from "../ui/GradientFace";
import { makePressable } from "../ui/Pressable";

export const PRESET_ICONS = [
  "coin",
  "star",
  "heart",
  "gem",
  "potion",
  "chest",
  "boot",
  "bomb",
  "burst",
  "sparkle",
  "bell",
  "skull",
] as const;

export type PresetIcon = (typeof PRESET_ICONS)[number];
export type PresetTextures = Record<PresetIcon, Texture>;

export const PAD_WIDTH = 45;
export const PAD_HEIGHT = 36;
const ICON_SIZE = 30;

/** Pixel-art preset tile with a stepped rim, crisp highlights, and a sprite face. */
export class PresetPad extends Container {
  constructor(icon: PresetIcon, textures: PresetTextures, selected = false) {
    super();
    this.addChild(drawPadFace(selected));
    const sprite = new Sprite(textures[icon]);
    sprite.width = ICON_SIZE;
    sprite.height = ICON_SIZE;
    sprite.position.set(
      (PAD_WIDTH - ICON_SIZE) / 2,
      (PAD_HEIGHT - ICON_SIZE) / 2,
    );
    this.addChild(sprite);
    makePressable(this);
  }
}

function drawPadFace(selected: boolean): Graphics {
  const faceColor = selected ? 0xfb87aa : 0xfdcc55;
  const topLight = selected ? 0xffe4ec : 0xfaf6ea;
  const bottomShade = selected ? 0xe0607f : 0xe87d50;
  const bottomEdge = selected ? 0xa93a5e : 0xd96a48;
  const pad = new Graphics();
  if (selected) {
    // Prominent multi-line pink selection perimeter from the reference.
    pad
      .poly(chamferPoints(-3, -3, PAD_WIDTH + 6, PAD_HEIGHT + 6, 5))
      .fill(0xff9ec2)
      .poly(chamferPoints(-1.5, -1.5, PAD_WIDTH + 3, PAD_HEIGHT + 3, 4))
      .fill(0xe95186);
  }
  // Continuous face with a fine bevel perimeter, like the reference surface.
  drawGradientFace(
    pad,
    0,
    0,
    PAD_WIDTH,
    PAD_HEIGHT,
    4,
    {
      edge: 0x24152e,
      top: topLight,
      mid: faceColor,
      bottom: bottomShade,
    },
    0.68,
    4,
  );
  pad.rect(4, PAD_HEIGHT - 3.5, PAD_WIDTH - 8, 1).fill(bottomEdge);
  return pad;
}
