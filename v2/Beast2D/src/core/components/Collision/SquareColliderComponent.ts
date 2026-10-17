import type { Graphics } from "pixi.js";
import {
  ColliderComponent,
  type ColliderDebugOptions,
  type ColliderOptions,
  type ColliderShape,
} from "./ColliderComponent";

/** Rectangle starting at the GameObject origin. Rotated rects use their world AABB. */
export class SquareColliderComponent extends ColliderComponent {
  private width: number;
  private height: number;

  constructor(
    width: number,
    height: number,
    collisionOptions: ColliderOptions = {},
    debugOptions: ColliderDebugOptions = {},
  ) {
    super(collisionOptions, debugOptions);
    this.width = width;
    this.height = height;
  }

  override getShape(): ColliderShape | null {
    if (!this.transform) return null;

    const corners = [
      this.transform.localToWorld(0, 0),
      this.transform.localToWorld(this.width, 0),
      this.transform.localToWorld(this.width, this.height),
      this.transform.localToWorld(0, this.height),
    ];
    const xs = corners.map((c) => c.x);
    const ys = corners.map((c) => c.y);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);

    return {
      type: "rect",
      x: minX,
      y: minY,
      width: Math.max(...xs) - minX,
      height: Math.max(...ys) - minY,
    };
  }

  protected override drawDebugShape(graphics: Graphics): void {
    graphics.rect(0, 0, this.width, this.height);
  }
}
