import { GameObject } from "../../../core/GameObject";
import { TransformComponent } from "../../../core/components/Movement/TransformComponent";
import { SpriteRenderComponent } from "../../../core/components/Render/SpriteRenderComponent";
import { VerticalMoveComponent } from "../../../core/components/Movement/VerticalMoveComponent";
import { DestroyOutOfBoundsComponent } from "../../../core/components/Behavior/DestroyBelowScreenComponent";
import { Globals } from "../../../core/Globals";
import { CircleColliderComponent } from "../../../core/components/Collision/CircleColliderComponent";
import {
  CollisionLayers,
  ColliderModes,
  PLAYFIELD_TOP,
  TEXTURE_SHOOTER_BULLET,
} from "../../../core/consts";
import { ScoreUI } from "../../../core/components/UI/ScoreUI";
import { ShooterEnemy } from "./ShooterEnemy";
import type { EnemyKind } from "./ShooterEnemy";

export class Bullet extends GameObject {
  constructor(x: number = 0, y: number = 0) {
    super();
    this.name = "Bullet";
    const size = 16;

    this.addComponent(new TransformComponent(x - size / 2, y - size / 2));
    this.addComponent(
      new SpriteRenderComponent(`/${TEXTURE_SHOOTER_BULLET}`, { alpha: 1 }),
    );
    this.addComponent(new VerticalMoveComponent(-8));
    this.addComponent(
      new CircleColliderComponent(5, {
        layer: CollisionLayers.Bullet,
        mode: ColliderModes.Active,
        mask: [CollisionLayers.Enemy],
        onCollisionEnter: (_self, other) => {
          const enemy = other.gameObject;
          if (enemy) {
            ScoreUI.addScore(100);
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
        maxX: Globals.canvasWidth + 20,
        minY: PLAYFIELD_TOP - 20,
        maxY: Globals.canvasHeight + 20,
      }),
    );
  }
}
