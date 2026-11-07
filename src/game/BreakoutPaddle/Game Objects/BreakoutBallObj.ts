import { GameObject } from "../../../core/GameObject";
import { Beast2D16 } from "../../../core/palette/beast2d16";
import { Circle } from "../../../core/prefabs/Circle";
import { BALL_RADIUS, type BallState } from "../breakoutLogic";

export class BreakoutBallObj extends GameObject {
  private readonly body: Circle;

  constructor() {
    super();
    this.name = "BreakoutBall";
    this.body = new Circle(0, 0, BALL_RADIUS, {
      color: Beast2D16.Cream,
      strokeColor: Beast2D16.PlumOutline,
      strokeWidth: 1,
    });
    this.addChild(this.body);
  }

  sync(state: BallState): void {
    if (!this.body.transform) return;
    this.body.transform.setPosition(
      state.x - BALL_RADIUS,
      state.y - BALL_RADIUS,
    );
  }
}
