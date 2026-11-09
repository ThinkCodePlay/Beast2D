import { GameObject } from "../../../core/GameObject";
import { TransformComponent } from "../../../core/components/Movement/TransformComponent";
import { SpriteRenderComponent } from "../../../core/components/Render/SpriteRenderComponent";
import { ConstantMoveComponent } from "../../../core/components/Movement/ConstantMoveComponent";
import { DestroyOutOfBoundsComponent } from "../../../core/components/Behavior/DestroyOutOfBoundsComponent";
import { CanvasSize } from "../../../core/canvasSize";
import { CircleColliderComponent } from "../../../core/components/Collision/CircleColliderComponent";
import {
  CollisionLayers,
  ColliderModes,
  PLAYFIELD_TOP,
} from "../../../core/display";
import { TEXTURE_SHOOTER_BULLET } from "../shooterAssets";
import { HudHeaderUI } from "../../../core/components/UI/HudHeaderUI";
import { ShooterEnemy } from "./ShooterEnemy";
import type { EnemyKind } from "./ShooterEnemy";

export class Bullet extends GameObject {
  constructor(x: number = 0, y: number = 0) {
    super();
    this.name = "Bullet";
    const size = 16;

    this.addComponent(new TransformComponent(x - size / 2, y - size / 2));
    this.addComponent(
      new SpriteRenderComponent(TEXTURE_SHOOTER_BULLET, { alpha: 1 }),
    );
    this.addComponent(new ConstantMoveComponent(0, -8));
    this.addComponent(
      new CircleColliderComponent(5, {
        layer: CollisionLayers.Bullet,
        mode: ColliderModes.Active,
        mask: [CollisionLayers.Enemy],
        onCollisionEnter: (_self, other) => {
          const enemy = other.gameObject;
          if (enemy) {
            HudHeaderUI.addScore(100);
            const { x: ex, y: ey } = enemy
              .getComponent(TransformComponent)
              ?.getWorldPosition() ?? { x: 0, y: 0 };
            const kind = enemy.name.replace("Enemy_", "") as EnemyKind;
            ShooterEnemy.spawnBurst(kind, ex, ey);
            enemy.destroy();
          }
          this.destroy();
        },
      }),
    );
    this.addComponent(
      new DestroyOutOfBoundsComponent({
        minX: -20,
        maxX: CanvasSize.canvasWidth + 20,
        minY: PLAYFIELD_TOP - 20,
        maxY: CanvasSize.canvasHeight + 20,
      }),
    );
  }
}
