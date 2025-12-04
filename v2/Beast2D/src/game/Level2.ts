// Level2.ts
// Second level with multiple bouncing circles

import { Level } from "../core/Level";
import { Circle } from "../core/prefabs/Circle";
import { Box } from "../core/prefabs/Box";
import { Globals } from "../core/Globals";
import { Ticker } from "pixi.js";

export class Level2 extends Level {
  private circles: Circle[] = [];
  private velocities: { x: number; y: number }[] = [];

  protected init() {
    // Create a centered box
    const box = new Box(
      Globals.stage,
      Globals.canvasWidth / 2 - 75,
      Globals.canvasHeight / 2 - 75,
      150,
      150,
      {
      color: 0x3366ff,
      strokeColor: 0xffffff,
      strokeWidth: 2,
    });
    this.levelRoot.addChild(box);

    // Create multiple bouncing circles
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff];
    for (let i = 0; i < 5; i++) {
      const circle = new Circle(
        Globals.stage,
        Math.random() * Globals.canvasWidth,
        Math.random() * Globals.canvasHeight,
        20 + Math.random() * 20,
        { color: colors[i % colors.length], strokeWidth: 2 }
      );
      this.circles.push(circle);
      this.levelRoot.addChild(circle);

      // Random velocity for each circle
      this.velocities.push({
        x: (Math.random() - 0.5) * 5,
        y: (Math.random() - 0.5) * 5,
      });
    }
  }

  protected update(ticker: Ticker) {
    super.update(ticker);

    // Animate bouncing circles
    this.circles.forEach((circle, i) => {
      if (!circle.transform) return;

      const vel = this.velocities[i];

      // Update position
      const newX = circle.transform.x + vel.x * ticker.deltaTime;
      const newY = circle.transform.y + vel.y * ticker.deltaTime;

      // Bounce off walls
      if (newX < 0 || newX > Globals.canvasWidth) vel.x *= -1;
      if (newY < 0 || newY > Globals.canvasHeight) vel.y *= -1;

      circle.transform.setPosition(newX, newY);
    });
  }
}
