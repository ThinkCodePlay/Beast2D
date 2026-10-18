import { describe, expect, it } from "vitest";
import { GameObject } from "../src/core/GameObject";
import { TransformComponent } from "../src/core/components/Movement/TransformComponent";

function nested() {
  const parent = new GameObject().with(new TransformComponent(100, 100));
  const child = new GameObject().with(new TransformComponent(10, 0));
  parent.addChild(child);
  return { parent, child };
}

describe("TransformComponent", () => {
  it("translate is a plain add", () => {
    const t = new TransformComponent(1, 1);
    t.translate(2, -3);
    expect([t.x, t.y]).toEqual([3, -2]);
  });

  it("localToWorld applies scale, rotation and translation", () => {
    const t = new GameObject().with(new TransformComponent(10, 20))
      .transform!;
    t.setScale(2);
    t.setRotation(Math.PI / 2);
    const p = t.localToWorld(1, 0);
    expect(p.x).toBeCloseTo(10);
    expect(p.y).toBeCloseTo(22);
  });

  it("rotated and scaled parents affect the child's world position", () => {
    const { parent, child } = nested();
    parent.transform!.setScale(2);
    parent.transform!.setRotation(Math.PI / 2);
    const p = child.transform!.getWorldPosition();
    expect(p.x).toBeCloseTo(100);
    expect(p.y).toBeCloseTo(120);
    expect(child.transform!.getWorldRotation()).toBeCloseTo(Math.PI / 2);
    expect(child.transform!.getWorldScale()).toEqual({ x: 2, y: 2 });
  });

  it("skips ancestors that have no transform", () => {
    const grand = new GameObject().with(new TransformComponent(5, 5));
    const middle = new GameObject();
    const leaf = new GameObject().with(new TransformComponent(1, 1));
    grand.addChild(middle);
    middle.addChild(leaf);
    expect(leaf.transform!.parentTransform).toBe(grand.transform);
    expect(leaf.getWorldPosition()).toEqual({ x: 6, y: 6 });
  });

  it("applyToContainer is a no-op without an owner", () => {
    expect(() => new TransformComponent().applyToContainer()).not.toThrow();
  });
});
