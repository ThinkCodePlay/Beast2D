import { GameObject } from "../../../core/GameObject";
import { TransformComponent } from "../../../core/components/Movement/TransformComponent";
import { CameraShakeComponent } from "../../../core/components/Behavior/CameraShakeComponent";
import { PLAYFIELD_TOP } from "../../../core/consts";

/** World root for gameplay (below HUD). Camera shake attaches here. */
export class ShooterPlayfield extends GameObject {
  static current: ShooterPlayfield | null = null;

  constructor() {
    super();
    this.name = "ShooterPlayfield";
    ShooterPlayfield.current = this;
    this.addComponent(new TransformComponent(0, PLAYFIELD_TOP));
    this.addComponent(new CameraShakeComponent({ intensity: 2 }));
  }

  shake(frames = 6, intensity = 2): void {
    const shake = this.getComponent(CameraShakeComponent);
    shake?.shake(frames, intensity);
  }

  protected override onDestroy(): void {
    if (ShooterPlayfield.current === this) {
      ShooterPlayfield.current = null;
    }
    super.onDestroy();
  }
}
