import { Component } from "../Component";
import { TransformComponent } from "../Movement/TransformComponent";
import { CollisionLayers, ColliderModes } from "../../consts";

export type ColliderMode = (typeof ColliderModes)[keyof typeof ColliderModes];
export type CollisionLayer =
  (typeof CollisionLayers)[keyof typeof CollisionLayers];

export type ColliderShape =
  | { type: "circle"; x: number; y: number; radius: number }
  | { type: "rect"; x: number; y: number; width: number; height: number };

export interface ColliderOptions {
  layer?: CollisionLayer;
  mode?: ColliderMode;
  mask?: CollisionLayer[];
  onCollisionEnter?: (
    self: ColliderComponent,
    other: ColliderComponent,
  ) => void;
}

export abstract class ColliderComponent extends Component {
  private static registry: Set<ColliderComponent> = new Set();

  readonly layer: CollisionLayer;
  readonly mode: ColliderMode;
  readonly mask: CollisionLayer[];
  readonly onCollisionEnter?: (
    self: ColliderComponent,
    other: ColliderComponent,
  ) => void;

  protected transform: TransformComponent | null = null;
  private activeCollisionKeys: Set<string> = new Set();
  protected isColliding: boolean = false;

  constructor(options: ColliderOptions = {}) {
    super();
    this.layer = options.layer ?? CollisionLayers.Default;
    this.mode = options.mode ?? ColliderModes.Passive;
    this.mask = options.mask ?? [];
    this.onCollisionEnter = options.onCollisionEnter;
  }

  override init(): void {
    if (!this.gameObject) return;

    this.transform = this.gameObject.getComponent(TransformComponent);
    ColliderComponent.registry.add(this);
  }

  override update(_deltaTime: number): void {
    if (!this.isActive()) return;

    const nextActiveKeys = new Set<string>();

    for (const other of ColliderComponent.registry) {
      if (!this.shouldCheckAgainst(other)) continue;

      if (!this.intersects(other)) continue;

      const collisionKey = this.getCollisionKey(other);
      nextActiveKeys.add(collisionKey);

      if (this.activeCollisionKeys.has(collisionKey)) continue;

      this.onCollisionEnter?.(this, other);
    }

    this.isColliding = nextActiveKeys.size > 0;
    this.activeCollisionKeys = nextActiveKeys;
  }

  override destroy(): void {
    ColliderComponent.registry.delete(this);
    this.activeCollisionKeys.clear();
  }

  protected abstract getShape(): ColliderShape | null;

  private isActive(): boolean {
    return (
      this.mode === ColliderModes.Active || this.mode === ColliderModes.Both
    );
  }

  private isPassive(): boolean {
    return (
      this.mode === ColliderModes.Passive || this.mode === ColliderModes.Both
    );
  }

  private shouldCheckAgainst(other: ColliderComponent): boolean {
    if (other === this) return false;
    if (!this.enabled || !other.enabled) return false;
    if (!this.gameObject || !other.gameObject) return false;
    if (!other.isPassive()) return false;
    if (this.mask.length > 0 && !this.mask.includes(other.layer)) return false;

    return true;
  }

  private intersects(other: ColliderComponent): boolean {
    const shapeA = this.getShape();
    const shapeB = other.getShape();

    if (!shapeA || !shapeB) return false;

    return ColliderComponent.intersectsShapes(shapeA, shapeB);
  }

  private getCollisionKey(other: ColliderComponent): string {
    const ownId = this.gameObject?.uuid ?? "self";
    const otherId = other.gameObject?.uuid ?? "other";
    return `${ownId}:${otherId}`;
  }

  private static intersectsShapes(a: ColliderShape, b: ColliderShape): boolean {
    if (a.type === "circle" && b.type === "circle") {
      return this.intersectsCircleCircle(a, b);
    }

    if (a.type === "rect" && b.type === "rect") {
      return this.intersectsRectRect(a, b);
    }

    if (a.type === "circle" && b.type === "rect") {
      return this.intersectsCircleRect(a, b);
    }

    if (a.type === "rect" && b.type === "circle") {
      return this.intersectsCircleRect(b, a);
    }

    return false;
  }

  private static intersectsCircleCircle(
    a: Extract<ColliderShape, { type: "circle" }>,
    b: Extract<ColliderShape, { type: "circle" }>,
  ): boolean {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const radiusSum = a.radius + b.radius;
    return dx * dx + dy * dy <= radiusSum * radiusSum;
  }

  private static intersectsRectRect(
    a: Extract<ColliderShape, { type: "rect" }>,
    b: Extract<ColliderShape, { type: "rect" }>,
  ): boolean {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  private static intersectsCircleRect(
    circle: Extract<ColliderShape, { type: "circle" }>,
    rect: Extract<ColliderShape, { type: "rect" }>,
  ): boolean {
    const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
    const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));

    const dx = circle.x - closestX;
    const dy = circle.y - closestY;

    return dx * dx + dy * dy <= circle.radius * circle.radius;
  }
}
