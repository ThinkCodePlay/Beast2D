/* CollisionSystem.ts
  Owns all colliders of an engine context. Each update it:
  - computes world shapes of enabled colliders,
  - uses a uniform grid as broadphase for passive colliders,
  - checks every active collider against its candidates in registration order
    (deterministic),
  - fires enter / stay / exit callbacks by diffing against the last update.
*/

import type { ColliderComponent } from "./components/Collision/ColliderComponent";
import {
  intersectsShapes,
  shapeBounds,
  type ColliderShape,
} from "./components/Collision/shapes";

export class CollisionSystem {
  private colliders: ColliderComponent[] = [];
  private order = new Map<ColliderComponent, number>();
  private contacts = new Map<ColliderComponent, Set<ColliderComponent>>();
  private nextOrder = 0;

  private readonly cellSize: number;

  constructor(cellSize: number = 64) {
    this.cellSize = cellSize;
  }

  get size(): number {
    return this.colliders.length;
  }

  register(collider: ColliderComponent): void {
    if (this.order.has(collider)) return;
    this.order.set(collider, this.nextOrder++);
    this.colliders.push(collider);
  }

  unregister(collider: ColliderComponent): void {
    if (!this.order.delete(collider)) return;
    this.colliders = this.colliders.filter((c) => c !== collider);
    this.contacts.delete(collider);
    for (const set of this.contacts.values()) set.delete(collider);
    collider.isColliding = false;
  }

  clear(): void {
    this.colliders = [];
    this.order.clear();
    this.contacts.clear();
  }

  update(): void {
    const shapes = new Map<ColliderComponent, ColliderShape>();
    for (const collider of this.colliders) {
      if (!collider.isLive()) continue;
      const shape = collider.getShape();
      if (shape) shapes.set(collider, shape);
    }

    const grid = new Map<string, ColliderComponent[]>();
    for (const [collider, shape] of shapes) {
      if (!collider.isPassiveMode()) continue;
      this.forEachCell(shape, (key) => {
        const bucket = grid.get(key);
        if (bucket) bucket.push(collider);
        else grid.set(key, [collider]);
      });
    }

    for (const collider of [...this.colliders]) {
      if (!collider.isActiveMode()) continue;

      const shape = shapes.get(collider);
      if (!shape || !collider.isLive()) {
        this.finishExits(collider, new Set());
        continue;
      }

      const candidates = new Set<ColliderComponent>();
      this.forEachCell(shape, (key) => {
        grid.get(key)?.forEach((other) => candidates.add(other));
      });

      const sorted = [...candidates].sort(
        (a, b) => (this.order.get(a) ?? 0) - (this.order.get(b) ?? 0),
      );

      const current = new Set<ColliderComponent>();
      for (const other of sorted) {
        if (!collider.accepts(other)) continue;
        const otherShape = shapes.get(other);
        if (otherShape && intersectsShapes(shape, otherShape)) {
          current.add(other);
        }
      }

      const previous = this.contacts.get(collider) ?? new Set();
      collider.isColliding = current.size > 0;
      this.contacts.set(collider, current);

      for (const other of current) {
        if (collider.isDestroyedOrGone() || other.isDestroyedOrGone()) continue;
        if (previous.has(other)) collider.onCollisionStay?.(collider, other);
        else collider.onCollisionEnter?.(collider, other);
      }
      this.finishExits(collider, current, previous);
    }
  }

  private finishExits(
    collider: ColliderComponent,
    current: Set<ColliderComponent>,
    previous: Set<ColliderComponent> = this.contacts.get(collider) ??
      new Set(),
  ): void {
    for (const other of previous) {
      if (current.has(other)) continue;
      if (this.order.has(other) && !other.isDestroyedOrGone()) {
        collider.onCollisionExit?.(collider, other);
      }
    }
    if (current.size === 0) collider.isColliding = false;
    this.contacts.set(collider, current);
  }

  private forEachCell(shape: ColliderShape, visit: (key: string) => void): void {
    const b = shapeBounds(shape);
    const x0 = Math.floor(b.minX / this.cellSize);
    const x1 = Math.floor(b.maxX / this.cellSize);
    const y0 = Math.floor(b.minY / this.cellSize);
    const y1 = Math.floor(b.maxY / this.cellSize);
    for (let x = x0; x <= x1; x += 1) {
      for (let y = y0; y <= y1; y += 1) visit(`${x},${y}`);
    }
  }
}
