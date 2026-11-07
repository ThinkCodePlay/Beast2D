import type { Graphics } from "pixi.js";
import {
  ColliderComponent,
  type ColliderDebugOptions,
  type ColliderOptions,
  type ColliderShape,
} from "./ColliderComponent";

/** Circle collider; default center is `(radius, radius)` like the Circle prefab. */
export class CircleColliderComponent extends ColliderComponent {
  private radius: number;
  private readonly centerX: number;
  private readonly centerY: number;

  constructor(
    radius: number,
    collisionOptions: ColliderOptions = {},
    debugOptions: ColliderDebugOptions = {},
    centerX: number = radius,
    centerY: number = centerX,
  ) {
    super(collisionOptions, debugOptions);
    this.radius = radius;
    this.centerX = centerX;
    this.centerY = centerY;
  }

  override getShape(): ColliderShape | null {
    if (!this.transform) return null;

    const scale = this.transform.getWorldScale();
    const center = this.transform.localToWorld(this.centerX, this.centerY);
    return {
      type: "circle",
      x: center.x,
      y: center.y,
      radius: this.radius * ((Math.abs(scale.x) + Math.abs(scale.y)) / 2),
    };
  }

  protected override drawDebugShape(graphics: Graphics): void {
    graphics.circle(this.centerX, this.centerY, this.radius);
  }
}
