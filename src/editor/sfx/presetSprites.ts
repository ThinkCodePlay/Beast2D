import type { PresetId } from "../../core/sfx/generate";

export const PRESET_SPRITE_W = 32;
export const PRESET_SPRITE_H = 28;

export type PresetSpriteId = PresetId | "dice";

const SPRITE_FILES: Record<PresetSpriteId, string> = {
  shoot: "shoot.png",
  coin: "coin.png",
  boom: "boom.png",
  hit: "hit.png",
  jump: "jump.png",
  power: "power.png",
  dice: "dice.png",
};

export function presetSpriteUrl(id: PresetSpriteId): string {
  return new URL(`../assets/sfx-presets/${SPRITE_FILES[id]}`, import.meta.url).href;
}