import { GameObject } from "../../../core/GameObject";
import { Beast2D16 } from "../../../core/ui/palette";
import { Box } from "../../../core/prefabs/Box";
import { createBrickGrid, type BrickState } from "../breakoutLogic";

export class BrickWall extends GameObject {
  readonly states: BrickState[];
  private readonly boxes: Box[] = [];

  constructor() {
    super();
    this.name = "BrickWall";
    this.states = createBrickGrid();
    for (const brick of this.states) {
      const box = new Box(brick.x, brick.y, brick.w, brick.h, {
        color: brick.color,
        strokeColor: Beast2D16.PlumOutline,
        strokeWidth: 1,
      });
      this.boxes.push(box);
      this.addChild(box);
    }
  }

  applyStates(next: BrickState[]): void {
    next.forEach((brick, i) => {
      this.states[i] = brick;
      this.boxes[i]!.container.visible = brick.alive;
    });
  }
}
