// Level1.ts
// First level with a rotating box and pulsing circle

import { Level } from "../core/Level";
import { Box } from "../core/prefabs/Box";
import { Circle } from "../core/prefabs/Circle";
import { Player } from "../core/prefabs/Player";
import { Globals } from "../core/Globals";
import { Ticker } from "pixi.js";

export class Level1 extends Level {
  private box: Box | null = null;
  private circle: Circle | null = null;

  protected init() {
    const SIZE = 100;
    const X = (Globals.canvasWidth - SIZE) / 2;
    const Y = (Globals.canvasHeight - SIZE) / 2;

    // Create a box
    this.box = new Box(Globals.stage, X, Y, SIZE, SIZE, {
      color: 0xff6600,
      strokeColor: 0x333333,
      strokeWidth: 3,
    });
    this.levelRoot.addChild(this.box);

    // Create a circle
    this.circle = new Circle(Globals.stage, 50, 50, 40, {
      color: 0x00ff00,
      strokeWidth: 2,
    });
    this.levelRoot.addChild(this.circle);

    // create player object
    this.levelRoot.addChild(new Player(Globals.stage, X, Y, SIZE, SIZE));
  }

  protected update(ticker: Ticker) {
    super.update(ticker);
    
    // Custom animations for Level 1
    this.box?.transform?.setRotation(
      this.box.transform.rotation + 0.01 * ticker.deltaTime
    );
    this.circle?.transform?.setScale(1 + 0.3 * Math.sin(ticker.lastTime / 200));
  }
}
