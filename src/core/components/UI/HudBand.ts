import { GameObject } from "../../GameObject";
import { DISPLAY_WIDTH } from "../../consts";
import { Beast2D16 } from "../../palette/beast2d16";
import { TransformComponent } from "../Movement/TransformComponent";
import { BoxRenderComponent } from "../Render/BoxRenderComponent";
import { HUD_HEIGHT } from "../../ui/hudLayout";

/** Full-width 320×16 header chrome shared by arcade demos. */
export class HudBand extends GameObject {
  constructor() {
    super();
    this.name = "HudBand";
    this.runWhenPaused = true;
    this.addComponent(new TransformComponent(0, 0));
    this.addComponent(
      new BoxRenderComponent(DISPLAY_WIDTH, HUD_HEIGHT, {
        color: Beast2D16.Shadow,
        strokeWidth: 0,
      }),
    );
  }
}
