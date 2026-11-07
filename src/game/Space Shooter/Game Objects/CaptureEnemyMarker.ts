import { GameObject } from "../../../core/GameObject";
import { TransformComponent } from "../../../core/components/Movement/TransformComponent";
import { SpriteRenderComponent } from "../../../core/components/Render/SpriteRenderComponent";

/** Staged still-frame enemy for `?capture=shooter&scene=gameplay` (no movement). */
export class CaptureEnemyMarker extends GameObject {
  constructor(x: number, y: number, texture: string) {
    super();
    this.name = "CaptureEnemyMarker";
    this.addComponent(new TransformComponent(x, y));
    this.addComponent(new SpriteRenderComponent(texture));
  }
}
