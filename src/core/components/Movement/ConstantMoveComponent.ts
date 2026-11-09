import { Component } from "../Component";
import { TransformComponent } from "./TransformComponent";

/** Constant velocity in pixels per frame-unit. Either axis may be 0. */
export class ConstantMoveComponent extends Component {
  private readonly velocityX: number;
  private readonly velocityY: number;
  private transform: TransformComponent | null = null;

  constructor(velocityX: number, velocityY: number) {
    super();
    this.velocityX = velocityX;
    this.velocityY = velocityY;
  }

  override onInit(): void {
    if (!this.gameObject) return;
    this.transform = this.gameObject.getRequiredComponent(
      TransformComponent,
      this.constructor.name,
    );
  }

  override update(deltaTime: number): void {
    if (!this.transform) return;
    this.transform.x += this.velocityX * deltaTime;
    this.transform.y += this.velocityY * deltaTime;
  }
}
