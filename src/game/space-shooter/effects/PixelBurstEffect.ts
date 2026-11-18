import { Graphics } from "pixi.js";
import { GameObject } from "../../../core/GameObject";
import { TransformComponent } from "../../../core/components/Movement/TransformComponent";
import type { PixelBurstPreset } from "./PixelEffectPresets";
import { PixelBurstEffectComponent } from "./PixelBurstEffectComponent";

/** Short-lived palette pixel burst drawn in world space. */
export class PixelBurstEffect extends GameObject {
  constructor(worldX: number, worldY: number, preset: PixelBurstPreset) {
    super();
    this.name = "PixelBurstEffect";
    this.runWhenPaused = true;
    const graphics = new Graphics();
    this.container.addChild(graphics);
    this.addComponent(new TransformComponent(worldX, worldY));
    this.addComponent(new PixelBurstEffectComponent(preset, graphics));
  }
}
