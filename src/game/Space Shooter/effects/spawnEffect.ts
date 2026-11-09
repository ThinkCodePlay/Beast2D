import type { GameObject } from "../../../core/GameObject";
import { PixelBurstEffect } from "./PixelBurstEffect";
import type { PixelBurstPreset } from "./PixelEffectPresets";

export function spawnPixelBurst(
  root: GameObject,
  x: number,
  y: number,
  preset: PixelBurstPreset,
): PixelBurstEffect {
  const effect = new PixelBurstEffect(x, y, preset);
  root.addChild(effect);
  return effect;
}
