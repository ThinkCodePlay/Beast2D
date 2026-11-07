import { GameObject } from "../../../core/GameObject";
import { DISPLAY_WIDTH, PIXEL_GRID } from "../../../core/consts";
import { Beast2D16 } from "../../../core/palette/beast2d16";
import { Box } from "../../../core/prefabs/Box";
import { HorizontalClampComponent } from "../../../core/components/Movement/HorizontalClampComponent";
import { HorizontalInputComponent } from "../../../core/components/Movement/HorizontalInputComponent";
import {
  defaultPaddleY,
  PADDLE_H,
  PADDLE_W,
  type PaddleState,
} from "../breakoutLogic";

const PADDLE_SPEED = 5.5;

export class BreakoutPaddleObj extends GameObject {
  private readonly body: Box;

  constructor() {
    super();
    this.name = "BreakoutPaddle";
    const y = defaultPaddleY();
    this.body = new Box(
      DISPLAY_WIDTH / 2 - PADDLE_W / 2,
      y,
      PADDLE_W,
      PADDLE_H,
      {
        color: Beast2D16.HotPink,
        strokeColor: Beast2D16.PlumOutline,
        strokeWidth: 1,
      },
    );
    this.body.addComponent(new HorizontalInputComponent(PADDLE_SPEED));
    this.body.addComponent(
      new HorizontalClampComponent(
        PIXEL_GRID,
        DISPLAY_WIDTH - PIXEL_GRID - PADDLE_W,
      ),
    );
    this.addChild(this.body);
  }

  readState(): PaddleState {
    const x = this.body.transform?.x ?? DISPLAY_WIDTH / 2 - PADDLE_W / 2;
    const y = this.body.transform?.y ?? defaultPaddleY();
    return { x, y, w: PADDLE_W, h: PADDLE_H };
  }
}
