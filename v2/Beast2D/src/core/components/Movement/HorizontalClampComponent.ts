import { Component } from "../Component";
import { TransformComponent } from "./TransformComponent";

export class HorizontalClampComponent extends Component {
  private minX: number;
  private maxX: number;

  constructor(minX: number, maxX: number) {
    super();
    this.minX = minX;
    this.maxX = maxX;
  }

  update(_deltaTime: number): void {
    if (!this.gameObject) {
      return;
    }

    const transform = this.gameObject.getComponent(TransformComponent);
    if (!transform) {
      console.warn("HorizontalClampComponent requires a TransformComponent");
      return;
    }

    const clampedX = Math.max(this.minX, Math.min(this.maxX, transform.x));
    if (clampedX !== transform.x) {
      transform.setPosition(clampedX, transform.y);
    }
  }
}
