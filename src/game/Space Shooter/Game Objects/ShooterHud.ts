import { GameObject } from "../../../core/GameObject";
import { TransformComponent } from "../../../core/components/Movement/TransformComponent";
import { SpriteRenderComponent } from "../../../core/components/Render/SpriteRenderComponent";
import { TEXTURE_SHOOTER_HUD } from "../../../core/consts";

/** Opaque HUD band along y=0–15. */
export class ShooterHud extends GameObject {
  constructor() {
    super();
    this.name = "ShooterHud";
    this.runWhenPaused = true;
    this.addComponent(new TransformComponent(0, 0));
    this.addComponent(
      new SpriteRenderComponent(`/${TEXTURE_SHOOTER_HUD}`, { alpha: 1 }),
    );
  }
}
