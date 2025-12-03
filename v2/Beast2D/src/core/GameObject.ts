import { Container, Graphics } from "pixi.js";

export class GameObject {
  uuid: string = crypto.randomUUID();
  x: number;
  y: number;
  width: number;
  height: number;
  container: Container;

  constructor(
    container: Container,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    this.container = container;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  create() {
    const cube = new Graphics()
      .rect(0, 0, this.width, this.height)
      .fill({ color: 0x00ccff })
      .stroke({ width: 2, color: 0x00334d });
    // Position roughly centered
    cube.x = this.x;
    cube.y = this.y;

    this.container.addChild(cube);
  }
}
