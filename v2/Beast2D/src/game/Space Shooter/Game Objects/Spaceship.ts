import { GameObject } from "../../../core/GameObject";
import { TransformComponent } from "../../../core/components/Movement/TransformComponent";
import { SpriteRenderComponent } from "../../../core/components/Render/SpriteRenederComponent";
import type { RenderOptions } from "../../../core/components/Render/RenderComponent";
import { HorizontalClampComponent } from "../../../core/components/Movement/HorizontalClampComponent";
import { HorizontalInputComponent } from "../../../core/components/Movement/HorizontalInputComponent";
import { Globals } from "../../../core/Globals";
import { BulletSpawner } from "./BulletSpawner";
import { SquareColliderComponent } from "../../../core/components/Collision/SquareColliderComponent";
import { CollisionLayers, ColliderModes } from "../../../core/consts";
import { HeartsUI } from "../../../core/components/UI/HeartsUI";
import { DialogUI } from "../../../core/components/UI/DialogUI";
import { ScoreUI } from "../../../core/components/UI/ScoreUI";

export class Spaceship extends GameObject {
  constructor(x: number = 0, y: number = 0, renderOptions: RenderOptions = {}) {
    super();
    const shipWidth = 64;
    this.name = "Spaceship";

    this.addComponent(new TransformComponent(x, y));
    this.addComponent(
      new SpriteRenderComponent("BeastShip.png", renderOptions),
    );
    this.addComponent(
      new SquareColliderComponent(shipWidth, shipWidth, {
        layer: CollisionLayers.Player,
        mode: ColliderModes.Active,
        mask: [CollisionLayers.Enemy],
        onCollisionEnter: (_self, other) => {
          const hearts = HeartsUI.decreaseHearts(1);
          if (hearts <= 0) {
            DialogUI.open("Game Over", ScoreUI.getScore());
            return;
          }

          const enemy = other.gameObject;
          if (!enemy) return;

          enemy.parent?.removeChild(enemy);
          enemy.destroy();
        },
      }),
    );
    this.addComponent(new HorizontalInputComponent(7));
    this.addComponent(
      new HorizontalClampComponent(0, Globals.canvasWidth - shipWidth),
    );

    // weapon system
    this.addChild(
      new BulletSpawner(
        () => this.transform?.x ?? 0,
        () => this.transform?.y ?? 0,
      ),
    );
  }
}
