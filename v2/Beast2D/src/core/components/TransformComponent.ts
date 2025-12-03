import { Component } from "./Component";

export class TransformComponent extends Component {
  x: number = 0;
  y: number = 0;
  rotation: number = 0;
  scaleX: number = 1;
  scaleY: number = 1;

  constructor(x: number = 0, y: number = 0) {
    super();
    this.x = x;
    this.y = y;
  }

  setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  setScale(x: number, y?: number): void {
    this.scaleX = x;
    this.scaleY = y ?? x;
  }

  translate(dx: number, dy: number): void {
    this.x += dx;
    this.y += dy;
  }

  rotate(angle: number): void {
    this.rotation += angle;
  }
}
