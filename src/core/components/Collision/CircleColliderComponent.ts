import type { Graphics } from "pixi.js";
import {
  ColliderComponent,
  type ColliderDebugOptions,
  type ColliderOptions,
  type ColliderShape,
} from "./ColliderComponent";

/** Circle whose bounding box starts at the GameObject origin (like the Circle prefab). */
export class CircleColliderComponent extends ColliderComponent {
  private radius: number;

  constructor(
    radius: number,
    collisionOptions: ColliderOptions = {},
    debugOptions: ColliderDebugOptions = {},
  ) {
    super(collisionOptions, debugOptions);
    this.radius = radius;
  }

  override getShape(): ColliderShape | null {
    if (!this.transform) return null;

    const scale = this.transform.getWorldScale();
    const center = this.transform.localToWorld(this.radius, this.radius);
    return {
      type: "circle",
      x: center.x,
      y: center.y,
      radius: this.radius * ((Math.abs(scale.x) + Math.abs(scale.y)) / 2),
    };
  }

  protected override drawDebugShape(graphics: Graphics): void {
    graphics.circle(this.radius, this.radius, this.radius);
  }
}
