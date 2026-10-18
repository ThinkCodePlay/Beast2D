import { Component } from "../Component";

export interface Point {
  x: number;
  y: number;
}

/* TransformComponent
  Local position / rotation / scale relative to the parent GameObject.
  The engine applies it to the GameObject's Pixi container once per frame
  (after all updates), so children automatically inherit it. World-space
  queries are computed here and never depend on the render state.
*/
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

  setRotation(angle: number): void {
    this.rotation = angle;
  }

  setScale(x: number, y?: number): void {
    this.scaleX = x;
    this.scaleY = y ?? x;
  }

  translate(dx: number, dy: number): void {
    this.x += dx;
    this.y += dy;
  }

  /** Transform of the nearest ancestor GameObject that has one. */
  get parentTransform(): TransformComponent | null {
    let node = this.gameObject?.parent ?? null;
    while (node) {
      const transform = node.getComponent(TransformComponent);
      if (transform) return transform;
      node = node.parent;
    }
    return null;
  }

  /** Converts a point in this object's local space to world space. */
  localToWorld(localX: number, localY: number): Point {
    const sx = localX * this.scaleX;
    const sy = localY * this.scaleY;
    const cos = Math.cos(this.rotation);
    const sin = Math.sin(this.rotation);
    const point = {
      x: this.x + sx * cos - sy * sin,
      y: this.y + sx * sin + sy * cos,
    };

    const parent = this.parentTransform;
    return parent ? parent.localToWorld(point.x, point.y) : point;
  }

  getWorldPosition(): Point {
    return this.localToWorld(0, 0);
  }

  getWorldRotation(): number {
    return this.rotation + (this.parentTransform?.getWorldRotation() ?? 0);
  }

  getWorldScale(): Point {
    const parent = this.parentTransform?.getWorldScale() ?? { x: 1, y: 1 };
    return { x: this.scaleX * parent.x, y: this.scaleY * parent.y };
  }

  /** Writes the local transform to the owning GameObject's container. */
  applyToContainer(): void {
    const container = this.gameObject?.container;
    if (!container) return;

    container.position.set(this.x, this.y);
    container.rotation = this.rotation;
    container.scale.set(this.scaleX, this.scaleY);
  }
}
