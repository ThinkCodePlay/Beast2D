import { Circle } from "../../../core/prefabs/Circle";
import { VerticalMoveComponent } from "../../../core/components/Movement/VerticalMoveComponent";
import { DestroyOutOfBoundsComponent } from "../../../core/components/Behavior/DestroyBelowScreenComponent";
import { Globals } from "../../../core/Globals";
import { CircleColliderComponent } from "../../../core/components/Collision/CircleColliderComponent";
import { CollisionLayers, ColliderModes } from "../../../core/consts";
import { ScoreUI } from "../../../core/components/UI/ScoreUI";

export class Bullet extends Circle {
  constructor(x: number = 0, y: number = 0) {
    super(x, y, 5, {
      color: 0xffff55,
      strokeColor: 0xffffff,
      strokeWidth: 1,
    });
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
            enemy.parent?.removeChild(enemy);
            enemy.destroy();
          }

          const bullet = this;
          bullet.parent?.removeChild(bullet);
          bullet.destroy();
        },
      }),
    );
    this.addComponent(
      new DestroyOutOfBoundsComponent({
        minX: -20,
        maxX: Globals.canvasWidth + 20,
        minY: -20,
        maxY: Globals.canvasHeight + 20,
      }),
    );
  }
}
