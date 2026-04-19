import { Component } from "../Component";
import { TransformComponent } from "./TransformComponent";

export class VerticalMoveComponent extends Component {
  private readonly speedY: number;
  private transform: TransformComponent | null = null;

  constructor(speedY: number) {
    super();
    this.speedY = speedY;
  }

  override init(): void {
    if (!this.gameObject) return;
    this.transform = this.gameObject.getComponent(TransformComponent);
  }

  override update(deltaTime: number): void {
    if (!this.transform) return;
    this.transform.y += this.speedY * deltaTime;
  }
}
