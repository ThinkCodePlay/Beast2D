import { GameObject } from "../../../core/GameObject";
import { TransformComponent } from "../../../core/components/Movement/TransformComponent";
import { SpritesheetAnimationRenderComponent } from "../../../core/components/Render/SpritesheetAnimationRenderComponent";
import { HorizontalInputComponent } from "../../../core/components/Movement/HorizontalInputComponent";
import { HorizontalClampComponent } from "../../../core/components/Movement/HorizontalClampComponent";
import { Globals } from "../../../core/Globals";
import {
  BUNNY_WALK_ANIMATION_COLUMNS,
  BUNNY_WALK_ANIMATION_FRAME_COUNT,
  BUNNY_SPRITE_SIZE,
  TEXTURE_BUNNY_WALK_ANIMATION,
} from "../../../core/consts";

export class BunnyPlayer extends GameObject {
  constructor(x: number, y: number) {
    super();
    this.name = "BunnyPlayer";

    this.addComponent(new TransformComponent(x, y));
    this.addComponent(
      new SpritesheetAnimationRenderComponent(
        TEXTURE_BUNNY_WALK_ANIMATION,
        {
          frameWidth: BUNNY_SPRITE_SIZE,
          frameHeight: BUNNY_SPRITE_SIZE,
          columns: BUNNY_WALK_ANIMATION_COLUMNS,
          frameCount: BUNNY_WALK_ANIMATION_FRAME_COUNT,
        },
      ),
    );
    this.addComponent(new HorizontalInputComponent(5));
    this.addComponent(
      new HorizontalClampComponent(
        0,
        Globals.canvasWidth - BUNNY_SPRITE_SIZE,
      ),
    );
  }
}
