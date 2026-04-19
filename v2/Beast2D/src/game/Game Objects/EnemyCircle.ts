import { Container } from "pixi.js";
import { Circle } from "../../core/prefabs/Circle";
import { VerticalMoveComponent } from "../../core/components/Movement/VerticalMoveComponent";
import { DestroyOutOfBoundsComponent } from "../../core/components/Behavior/DestroyOutOfBoundsComponent";
import { Globals } from "../../core/Globals";
import { CircleColliderComponent } from "../../core/components/Collision/CircleColliderComponent";
import { CollisionLayers, ColliderModes } from "../../core/consts";

export class EnemyCircle extends Circle {
  constructor(container: Container, x: number = 0, y: number = 0) {
    super(container, x, y, 12, {
      color: 0xff4444,
      strokeColor: 0xffffff,
      strokeWidth: 2,
    });
    this.addComponent(new VerticalMoveComponent(2));
    this.addComponent(
      new CircleColliderComponent(12, {
        layer: CollisionLayers.Enemy,
        mode: ColliderModes.Both,
        mask: [CollisionLayers.Player],
        onCollisionEnter: (self) => {
          const enemy = self.gameObject;
          if (!enemy) return;

          enemy.parent?.removeChild(enemy);
          enemy.destroy();
        },
      }),
    );
    this.addComponent(
      new DestroyOutOfBoundsComponent({
        minX: -24,
        maxX: Globals.canvasWidth + 24,
        minY: -24,
        maxY: Globals.canvasHeight + 24,
      }),
    );
  }
}
