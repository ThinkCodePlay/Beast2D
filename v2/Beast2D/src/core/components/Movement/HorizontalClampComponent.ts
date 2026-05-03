import { Component } from "../Component";
import { TransformComponent } from "./TransformComponent";

export class HorizontalClampComponent extends Component {
  private minX: number;
  private maxX: number;
  private transform: TransformComponent | null = null;

  constructor(minX: number, maxX: number) {
    super();
    this.minX = minX;
    this.maxX = maxX;
  }

  override init(): void {
    if (!this.gameObject) return;
    this.transform = this.gameObject.getRequiredComponent(
      TransformComponent,
      this.constructor.name,
    );
  }

  update(_deltaTime: number): void {
    if (!this.transform) {
      return;
    }

    const clampedX = Math.max(this.minX, Math.min(this.maxX, this.transform.x));
    if (clampedX !== this.transform.x) {
      this.transform.setPosition(clampedX, this.transform.y);
    }
  }
}
