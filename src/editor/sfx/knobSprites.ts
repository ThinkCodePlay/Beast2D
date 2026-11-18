import type { KnobId } from "../../core/sfx/chips";

export const KNOB_SPRITE_W = 16;
export const KNOB_SPRITE_H = 16;

export type KnobSpriteVariant =
  "red" | "yellow" | "sky" | "leaf" | "stone" | "hotpink";

const FILES: Record<KnobSpriteVariant, string> = {
  red: "knob-red.png",
  yellow: "knob-yellow.png",
  sky: "knob-sky.png",
  leaf: "knob-leaf.png",
  stone: "knob-stone.png",
  hotpink: "knob-hotpink.png",
};

const KNOB_VARIANT: Record<KnobId, KnobSpriteVariant> = {
  vol: "red",
  attack: "yellow",
  decay: "yellow",
  rate: "sky",
  slide: "sky",
  vibrato: "leaf",
  duty: "leaf",
  cutoff: "stone",
};

export function knobSpriteVariant(
  id: KnobId,
  dragging: boolean,
): KnobSpriteVariant {
  if (dragging) return "hotpink";
  return KNOB_VARIANT[id];
}

export function knobSpriteUrl(variant: KnobSpriteVariant): string {
  return new URL(`../assets/sfx-knobs/${FILES[variant]}`, import.meta.url).href;
}
