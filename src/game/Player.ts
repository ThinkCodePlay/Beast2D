import { GameObject } from "../core/GameObject";
import { TransformComponent } from "../core/components/Movement/TransformComponent";
import { SpriteRenderComponent } from "../core/components/Render/SpriteRenderComponent";
import { Movement } from "../core/components/Movement/Movement";
import { KeyboardMovement } from "../core/components/Movement/KeyboardMovement";
import type { RenderOptions } from "../core/components/Render/RenderComponent";
import { ObjectNames, CollisionLayers, ColliderModes, SPRITE_SIZE } from "../core/display";
import { TEXTURE_BEAST_SHIP } from "./publicAssets";
import { SquareColliderComponent } from "../core/components/Collision/SquareColliderComponent";

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
