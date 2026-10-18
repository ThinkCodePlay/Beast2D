import { GameObject } from "../GameObject";
import { TransformComponent } from "../components/Movement/TransformComponent";
import { SpriteRenderComponent } from "../components/Render/SpriteRenderComponent";
import { UserInputComponent } from "../components/Movement/UserInputComponent";
import type { RenderOptions } from "../components/Render/RenderComponent";
import { ObjectNames, CollisionLayers, ColliderModes } from "../consts";
import { SquareColliderComponent } from "../components/Collision/SquareColliderComponent";

export class Player extends GameObject {
  constructor(x: number = 0, y: number = 0, renderOptions: RenderOptions = {}) {
    super();
    const playerSize = 64;
    this.name = ObjectNames.BoxObject;
    this.addComponent(new TransformComponent(x, y));
    this.addComponent(
      new SpriteRenderComponent("BeastShip.png", renderOptions),
    );
    this.addComponent(
      new SquareColliderComponent(playerSize, playerSize, {
        layer: CollisionLayers.Player,
        mode: ColliderModes.Passive,
      }),
    );
    this.addComponent(new UserInputComponent());
  }
}
