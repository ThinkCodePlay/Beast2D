import { GameObject } from "../../../core/GameObject";
import { TransformComponent } from "../../../core/components/Movement/TransformComponent";
import { SpawnerComponent } from "../../../core/components/Behavior/SpawnerComponent";
import { SpaceShootInputComponent } from "../../../core/components/Input/SpaceShootInputComponent";
import { MUZZLE_FLASH } from "../../../core/effects/PixelEffectPresets";
import { spawnPixelBurst } from "../../../core/effects/spawnEffect";
import { ShooterPlayfield } from "./ShooterPlayfield";
import { Bullet } from "./Bullet";

/**
 * Child of the ship. Its transform is the muzzle position relative to the
 * ship, so bullets are spawned at its world position into the level root
 * (not as ship children, which would make them follow the ship).
 */
export class BulletSpawner extends GameObject {
  constructor(offsetX: number = 12, offsetY: number = -4) {
    super();
    this.name = "BulletSpawner";
    this.addComponent(new TransformComponent(offsetX, offsetY));
    this.setupWeaponSystem();
  }

  private setupWeaponSystem(): void {
    const spawner = this.addComponent(
      new SpawnerComponent(0.2, 0, 0, () => {
        const { x, y } = this.getWorldPosition();
        const playfield = ShooterPlayfield.current;
        const root = this.root;
        root.addChild(new Bullet(x, y));
        if (playfield) {
          spawnPixelBurst(playfield, x, y - 4, MUZZLE_FLASH);
        }
      }),
    );

    spawner.enabled = false;
    this.addComponent(new SpaceShootInputComponent(spawner));
  }
}
