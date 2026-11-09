import { GameObject } from "../../../core/GameObject";
import { TransformComponent } from "../../../core/components/Movement/TransformComponent";
import { SpriteAnimationComponent } from "../../../core/components/Render/SpriteAnimationComponent";
import { Movement } from "../../../core/components/Movement/Movement";
import { KeyboardMovement } from "../../../core/components/Movement/KeyboardMovement";
import { ClampComponent } from "../../../core/components/Movement/ClampComponent";
import { HorizontalFacingComponent } from "../components/HorizontalFacingComponent";
import { HorizontalLocomotionAnimationComponent } from "../components/HorizontalLocomotionAnimationComponent";
import { CanvasSize } from "../../../core/canvasSize";
import {
  BUNNY_WALK_ANIMATION_COLUMNS,
  BUNNY_WALK_ANIMATION_FRAME_COUNT,
  BUNNY_SPRITE_SIZE,
  TEXTURE_BUNNY_IDLE,
  TEXTURE_BUNNY_WALK_ANIMATION,
} from "../../publicAssets";

export class BunnyPlayer extends GameObject {
  constructor(x: number, y: number) {
    super();
    this.name = "BunnyPlayer";

    this.addComponent(new TransformComponent(x, y));
    this.addComponent(
      new SpriteAnimationComponent({
        defaultClip: "idle",
        clips: {
          idle: {
            texturePath: TEXTURE_BUNNY_IDLE,
            frameWidth: BUNNY_SPRITE_SIZE,
            frameHeight: BUNNY_SPRITE_SIZE,
            columns: 1,
            frameCount: 1,
            loop: true,
          },
          walk: {
            texturePath: TEXTURE_BUNNY_WALK_ANIMATION,
            frameWidth: BUNNY_SPRITE_SIZE,
            frameHeight: BUNNY_SPRITE_SIZE,
            columns: BUNNY_WALK_ANIMATION_COLUMNS,
            frameCount: BUNNY_WALK_ANIMATION_FRAME_COUNT,
            animationSpeed: 0.2,
            loop: true,
          },
        },
      }),
    );
    this.addComponent(new Movement(1, { x: true, y: false }));
    this.addComponent(new KeyboardMovement());
    this.addComponent(new HorizontalFacingComponent());
    this.addComponent(new HorizontalLocomotionAnimationComponent());
    this.addComponent(
      new ClampComponent({
        minX: 0,
        maxX: CanvasSize.canvasWidth - BUNNY_SPRITE_SIZE,
      }),
    );
  }
}
