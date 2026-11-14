import type { WaveId } from "../../core/sfx/chips";

export const WAVE_SPRITE_W = 36;
export const WAVE_SPRITE_H = 24;

const FILES: Record<WaveId, string> = {
  sqr: "wave-sqr.png",
  pls: "wave-pls.png",
  wave: "wave-sine.png",
  noise: "wave-noise.png",
  saw: "wave-saw.png",
  tri: "wave-tri.png",
};

export function waveSpriteUrl(id: WaveId): string {
  return new URL(`../assets/sfx-waves/${FILES[id]}`, import.meta.url).href;
}