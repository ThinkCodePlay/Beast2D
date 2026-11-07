import { GameObject } from "../../../core/GameObject";
import { TransformComponent } from "../../../core/components/Movement/TransformComponent";
import { SpritesheetAnimationRenderComponent } from "../../../core/components/Render/SpritesheetAnimationRenderComponent";
import { HorizontalInputComponent } from "../../../core/components/Movement/HorizontalInputComponent";
import { HorizontalFacingComponent } from "../../../core/components/Movement/HorizontalFacingComponent";
import { HorizontalLocomotionAnimationComponent } from "../../../core/components/Behavior/HorizontalLocomotionAnimationComponent";
import { HorizontalClampComponent } from "../../../core/components/Movement/HorizontalClampComponent";
import { Globals } from "../../../core/Globals";
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
      new SpritesheetAnimationRenderComponent({
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
    this.addComponent(new HorizontalInputComponent(1));
    this.addComponent(new HorizontalFacingComponent());
    this.addComponent(new HorizontalLocomotionAnimationComponent());
    this.addComponent(
      new HorizontalClampComponent(
        0,
        Globals.canvasWidth - BUNNY_SPRITE_SIZE,
      ),
    );
  }
}
