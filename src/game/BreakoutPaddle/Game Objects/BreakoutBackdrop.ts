import { GameObject } from "../../../core/GameObject";
import { DISPLAY_HEIGHT, DISPLAY_WIDTH } from "../../../core/display";
import { Beast2D16 } from "../../../core/ui/palette";
import { Box } from "../../../core/prefabs/Box";

export class BreakoutBackdrop extends GameObject {
  constructor() {
    super();
    this.name = "BreakoutBackdrop";
    this.runWhenPaused = true;
    const fill = new Box(0, 0, DISPLAY_WIDTH, DISPLAY_HEIGHT, {
      color: Beast2D16.PlumOutline,
      strokeWidth: 0,
    });
    this.addChild(fill);
  }
}
