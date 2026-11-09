import { GameObject } from "../GameObject";
import { TransformComponent } from "../components/Movement/TransformComponent";
import { SpriteRenderComponent } from "../components/Render/SpriteRenderComponent";
import { Movement } from "../components/Movement/Movement";
import { KeyboardMovement } from "../components/Movement/KeyboardMovement";
import type { RenderOptions } from "../components/Render/RenderComponent";
import { ObjectNames, CollisionLayers, ColliderModes, SPRITE_SIZE } from "../consts";
import { TEXTURE_BEAST_SHIP } from "../../game/publicAssets";
import { SquareColliderComponent } from "../components/Collision/SquareColliderComponent";

export class Player extends GameObject {
  constructor(x: number = 0, y: number = 0, renderOptions: RenderOptions = {}) {
    super();
    const playerSize = SPRITE_SIZE;
    this.name = ObjectNames.BoxObject;
    this.addComponent(new TransformComponent(x, y));
    this.addComponent(
      new SpriteRenderComponent(TEXTURE_BEAST_SHIP, renderOptions),
    );
    this.addComponent(
      new SquareColliderComponent(playerSize, playerSize, {
        layer: CollisionLayers.Player,
        mode: ColliderModes.Passive,
      }),
    );
    this.addComponent(new Movement(5));
    this.addComponent(new KeyboardMovement());
  }
}
