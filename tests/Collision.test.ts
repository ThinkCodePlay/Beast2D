import { describe, expect, it } from "vitest";
import { GameObject } from "../src/core/GameObject";
import { TransformComponent } from "../src/core/components/Movement/TransformComponent";
import {
  ColliderComponent,
  type ColliderOptions,
} from "../src/core/components/Collision/ColliderComponent";
import { CircleColliderComponent } from "../src/core/components/Collision/CircleColliderComponent";
import { SquareColliderComponent } from "../src/core/components/Collision/SquareColliderComponent";
import {
  intersectsShapes,
  shapeBounds,
} from "../src/core/components/Collision/shapes";
import { ColliderModes, CollisionLayers } from "../src/core/consts";
import { createRoot, frame } from "./helpers";

describe("shapes", () => {
  it("circle vs circle", () => {
    const a = { type: "circle", x: 0, y: 0, radius: 5 } as const;
    expect(intersectsShapes(a, { ...a, x: 9 })).toBe(true);
    expect(intersectsShapes(a, { ...a, x: 10 })).toBe(true); // touching
    expect(intersectsShapes(a, { ...a, x: 11 })).toBe(false);
  });

  it("rect vs rect (touching edges do not overlap)", () => {
    const a = { type: "rect", x: 0, y: 0, width: 10, height: 10 } as const;
    expect(intersectsShapes(a, { ...a, x: 9 })).toBe(true);
    expect(intersectsShapes(a, { ...a, x: 10 })).toBe(false);
  });

  it("circle vs rect in both argument orders", () => {
    const circle = { type: "circle", x: 15, y: 5, radius: 5 } as const;
    const rect = { type: "rect", x: 0, y: 0, width: 10, height: 10 } as const;
    expect(intersectsShapes(circle, rect)).toBe(true);
    expect(intersectsShapes(rect, circle)).toBe(true);
    expect(intersectsShapes({ ...circle, x: 16 }, rect)).toBe(false);
  });

  it("computes bounds", () => {
    expect(shapeBounds({ type: "circle", x: 5, y: 5, radius: 2 })).toEqual({
      minX: 3,
      minY: 3,
      maxX: 7,
      maxY: 7,
    });
  });
});

function makeBox(
  x: number,
  y: number,
  options: ColliderOptions,
  size = 10,
): GameObject {
  return new GameObject()
    .with(new TransformComponent(x, y))
    .with(new SquareColliderComponent(size, size, options));
}

describe("CollisionSystem", () => {
  it("fires enter once, stay while overlapping, then exit", () => {
    const events: string[] = [];
    const root = createRoot();
    const hitter = makeBox(0, 0, {
      mode: ColliderModes.Active,
      onCollisionEnter: () => events.push("enter"),
      onCollisionStay: () => events.push("stay"),
      onCollisionExit: () => events.push("exit"),
    });
    const target = makeBox(100, 0, {});
    root.addChild(hitter);
    root.addChild(target);

    frame(root);
    expect(events).toEqual([]);

    target.transform!.setPosition(5, 0);
    frame(root);
    frame(root);
    target.transform!.setPosition(100, 0);
    frame(root);
    frame(root);

    expect(events).toEqual(["enter", "stay", "exit"]);
  });

  it("passive colliders alone never fire", () => {
    const events: string[] = [];
    const root = createRoot();
    root.addChild(makeBox(0, 0, { onCollisionEnter: () => events.push("x") }));
    root.addChild(makeBox(0, 0, {}));
    frame(root);
    expect(events).toEqual([]);
  });

  it("respects the mask", () => {
    const hits: string[] = [];
    const root = createRoot();
    root.addChild(
      makeBox(0, 0, {
        mode: ColliderModes.Active,
        mask: [CollisionLayers.Enemy],
        onCollisionEnter: (_s, o) => hits.push(o.layer),
      }),
    );
    root.addChild(makeBox(0, 0, { layer: CollisionLayers.Player }));
    root.addChild(makeBox(0, 0, { layer: CollisionLayers.Enemy }));
    frame(root);
    expect(hits).toEqual([CollisionLayers.Enemy]);
  });

  it("Both mode collides with other Both colliders from each side", () => {
    let count = 0;
    const root = createRoot();
    const options: ColliderOptions = {
      mode: ColliderModes.Both,
      onCollisionEnter: () => count++,
    };
    root.addChild(makeBox(0, 0, options));
    root.addChild(makeBox(5, 5, options));
    frame(root);
    expect(count).toBe(2);
  });

  it("uses world positions of nested objects", () => {
    let hit = false;
    const root = createRoot();
    const parent = new GameObject().with(new TransformComponent(200, 0));
    const child = makeBox(0, 0, {
      mode: ColliderModes.Active,
      onCollisionEnter: () => (hit = true),
    });
    parent.addChild(child);
    root.addChild(parent);
    root.addChild(makeBox(205, 0, {}));
    frame(root);
    expect(hit).toBe(true);
  });

  it("circle colliders use the circle centre and world scale", () => {
    const go = new GameObject()
      .with(new TransformComponent(10, 10))
      .with(new CircleColliderComponent(5));
    const collider = go.getComponent(ColliderComponent)!;
    go.update(1);
    expect(collider.getShape()).toEqual({
      type: "circle",
      x: 15,
      y: 15,
      radius: 5,
    });
    go.transform!.setScale(2);
    expect(collider.getShape()).toMatchObject({ x: 20, y: 20, radius: 10 });
  });

  it("rotated rect colliders use their world AABB", () => {
    const go = new GameObject()
      .with(new TransformComponent(0, 0))
      .with(new SquareColliderComponent(10, 10));
    go.update(1);
    go.transform!.setRotation(Math.PI / 2);
    const shape = go.getComponent(ColliderComponent)!.getShape()!;
    expect(shape.type).toBe("rect");
    if (shape.type === "rect") {
      expect(shape.x).toBeCloseTo(-10);
      expect(shape.width).toBeCloseTo(10);
    }
  });

  it("finds overlaps across many objects and far cells (broadphase)", () => {
    const hits: number[] = [];
    const root = createRoot();
    root.addChild(
      makeBox(1000, 1000, {
        mode: ColliderModes.Active,
        onCollisionEnter: (_s, o) =>
          hits.push(o.gameObject!.transform!.x),
      }),
    );
    for (let i = 0; i < 50; i += 1) root.addChild(makeBox(i * 40, 0, {}));
    root.addChild(makeBox(1005, 1005, {}));
    root.addChild(makeBox(-500, -500, {}));
    frame(root);
    expect(hits).toEqual([1005]);
  });

  it("is deterministic: callbacks follow registration order", () => {
    const order: number[] = [];
    const root = createRoot();
    root.addChild(
      makeBox(0, 0, {
        mode: ColliderModes.Active,
        onCollisionEnter: (_s, o) => order.push(o.gameObject!.transform!.y),
      }, 50),
    );
    for (const y of [30, 10, 20]) root.addChild(makeBox(0, y, {}));
    frame(root);
    expect(order).toEqual([30, 10, 20]);
  });

  it("does not notify about destroyed objects and unregisters them", () => {
    let enters = 0;
    const root = createRoot();
    const target = makeBox(0, 0, {});
    root.addChild(
      makeBox(0, 0, {
        mode: ColliderModes.Active,
        onCollisionEnter: () => enters++,
      }),
    );
    root.addChild(target);
    frame(root);
    expect(enters).toBe(1);
    expect(root.context!.collisions.size).toBe(2);

    target.destroy();
    frame(root);
    expect(root.context!.collisions.size).toBe(1);
    expect(enters).toBe(1);
  });

  it("a collision callback may destroy objects safely (no hits after destroy)", () => {
    const root = createRoot();
    const bullet = makeBox(0, 0, {
      mode: ColliderModes.Active,
      onCollisionEnter: (self, other) => {
        self.gameObject?.destroy();
        other.gameObject?.destroy();
      },
    });
    const enemy1 = makeBox(0, 0, {});
    const enemy2 = makeBox(0, 0, {});
    [bullet, enemy1, enemy2].forEach((o) => root.addChild(o));
    expect(() => frame(root)).not.toThrow();
    // The bullet hit the first enemy and was destroyed, so the second is untouched.
    expect(root.children).toEqual([enemy2]);
    expect(enemy1.destroyed).toBe(true);
    expect(bullet.destroyed).toBe(true);
  });

  it("an enabled flag off stops a collider from being detected", () => {
    let enters = 0;
    const root = createRoot();
    root.addChild(
      makeBox(0, 0, {
        mode: ColliderModes.Active,
        onCollisionEnter: () => enters++,
      }),
    );
    const other = makeBox(0, 0, {});
    root.addChild(other);
    other.getComponent(ColliderComponent)!.enabled = false;
    frame(root);
    expect(enters).toBe(0);
  });

  it("sets isColliding for debug highlighting", () => {
    const root = createRoot();
    const a = makeBox(0, 0, { mode: ColliderModes.Active });
    root.addChild(a);
    root.addChild(makeBox(0, 0, {}));
    frame(root);
    expect(a.getComponent(ColliderComponent)!.isColliding).toBe(true);
  });

  it("clear() empties the system", () => {
    const root = createRoot();
    root.addChild(makeBox(0, 0, {}));
    frame(root);
    root.context!.collisions.clear();
    expect(root.context!.collisions.size).toBe(0);
  });
});
