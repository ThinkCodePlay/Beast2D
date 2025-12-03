import { Component } from "./Component";

export class TransformComponent extends Component {
  get x(): number {
    return this.gameObject?.x ?? 0;
  }

  set x(value: number) {
    if (this.gameObject) {
      this.gameObject.x = value;
    }
  }

  get y(): number {
    return this.gameObject?.y ?? 0;
  }

  set y(value: number) {
    if (this.gameObject) {
      this.gameObject.y = value;
    }
  }

  get rotation(): number {
    return this.gameObject?.rotation ?? 0;
  }

  set rotation(value: number) {
    if (this.gameObject) {
      this.gameObject.rotation = value;
    }
  }

  get scaleX(): number {
    return this.gameObject?.scaleX ?? 1;
  }

  set scaleX(value: number) {
    if (this.gameObject) {
      this.gameObject.scaleX = value;
    }
  }

  get scaleY(): number {
    return this.gameObject?.scaleY ?? 1;
  }

  set scaleY(value: number) {
    if (this.gameObject) {
      this.gameObject.scaleY = value;
    }
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
