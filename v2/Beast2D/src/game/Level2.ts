// Level2.ts
// Second level with multiple bouncing circles

import { Level } from "../core/Level";
import { Circle } from "../core/prefabs/Circle";
import { Box } from "../core/prefabs/Box";
import { Ticker } from "pixi.js";

export class Level2 extends Level {
  private circles: Circle[] = [];
  private velocities: { x: number; y: number }[] = [];

  protected init() {
    const stage = this.engine.app.stage;
    const width = this.engine.app.renderer.width;
    const height = this.engine.app.renderer.height;

    // Create a centered box
    const box = new Box(stage, width / 2 - 75, height / 2 - 75, 150, 150, {
      color: 0x3366ff,
      strokeColor: 0xffffff,
      strokeWidth: 2,
    });
    this.objects.push(box);

    // Create multiple bouncing circles
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff];
    for (let i = 0; i < 5; i++) {
      const circle = new Circle(
        stage,
        Math.random() * width,
        Math.random() * height,
        20 + Math.random() * 20,
        { color: colors[i % colors.length], strokeWidth: 2 }
      );
      this.circles.push(circle);
      this.objects.push(circle);

      // Random velocity for each circle
      this.velocities.push({
        x: (Math.random() - 0.5) * 5,
        y: (Math.random() - 0.5) * 5,
      });
    }
  }

  protected update(ticker: Ticker) {
    super.update(ticker);

    const width = this.engine.app.renderer.width;
    const height = this.engine.app.renderer.height;

    // Animate bouncing circles
    this.circles.forEach((circle, i) => {
      if (!circle.transform) return;

      const vel = this.velocities[i];

      // Update position
      const newX = circle.transform.x + vel.x * ticker.deltaTime;
      const newY = circle.transform.y + vel.y * ticker.deltaTime;

      // Bounce off walls
      if (newX < 0 || newX > width) vel.x *= -1;
      if (newY < 0 || newY > height) vel.y *= -1;

      circle.transform.setPosition(newX, newY);
    });
  }
}
