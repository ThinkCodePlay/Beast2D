// Level1.ts
// First level with a rotating box and pulsing circle

import { Level } from "../core/Level";
import { Box } from "../core/prefabs/Box";
import { Circle } from "../core/prefabs/Circle";
import { Player } from "./Player";
import { CanvasSize } from "../core/canvasSize";
import { PIXEL_GRID } from "../core/display";
import { TEXTURE_BEAST_SHIP } from "./publicAssets";

export class Level1 extends Level {
  override assets = [TEXTURE_BEAST_SHIP];

  private box: Box | null = null;
  private circle: Circle | null = null;

  protected init() {
    const SIZE = PIXEL_GRID * 5;
    const X = (CanvasSize.canvasWidth - SIZE) / 2;
    const Y = (CanvasSize.canvasHeight - SIZE) / 2;

    // Create a box
    this.box = new Box(X, Y, SIZE, SIZE, {
      color: 0xff6600,
      strokeColor: 0x333333,
      strokeWidth: 3,
    });
    this.levelRoot.addChild(this.box);

    // Create a circle
    this.circle = new Circle(PIXEL_GRID * 3, PIXEL_GRID * 3, PIXEL_GRID * 2 + PIXEL_GRID / 2, {
      color: 0x00ff00,
      strokeWidth: 2,
    });
    this.levelRoot.addChild(this.circle);

    // create player object
    this.levelRoot.addChild(new Player(X, Y));
  }

  protected update(deltaTime: number) {
    super.update(deltaTime);

    // Custom animations for Level 1
    this.box?.transform?.setRotation(
      this.box.transform.rotation + 0.01 * deltaTime,
    );
    this.circle?.transform?.setScale(1 + 0.3 * Math.sin(this.context.time.elapsed * 5));
  }
}
