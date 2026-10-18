import { describe, expect, it } from "vitest";
import { GameObject } from "../src/core/GameObject";
import { Component } from "../src/core/components/Component";
import { SpawnerComponent } from "../src/core/components/Behavior/SpawnerComponent";
import { TransformComponent } from "../src/core/components/Movement/TransformComponent";

class Recorder extends Component {
  log: string[] = [];
  override onInit() {
    this.log.push("init");
  }
  override update() {
    this.log.push("update");
  }
  override onDestroy() {
    this.log.push("destroy");
  }
}

describe("GameObject lifecycle", () => {
  it("runs onInit once before the first update", () => {
    const go = new GameObject();
    const r = go.addComponent(new Recorder());
    expect(r.log).toEqual([]);
    go.update(1);
    go.update(1);
    expect(r.log).toEqual(["init", "update", "update"]);
  });

  it("destroys once, deferred to flush, and detaches from parent", () => {
    const root = new GameObject();
    const go = new GameObject();
    const r = go.addComponent(new Recorder());
    root.addChild(go);
    root.update(1);
    go.destroy();
    go.destroy();
    expect(root.children).toHaveLength(0);
    expect(r.log).toEqual(["init", "update"]);
    GameObject.flushDestroyed();
    GameObject.flushDestroyed();
    expect(r.log).toEqual(["init", "update", "destroy"]);
  });

  it("does not skip siblings when a child is destroyed during update", () => {
    class SelfDestruct extends Component {
      override update() {
        this.gameObject?.destroy();
      }
    }
    const root = new GameObject();
    const a = new GameObject();
    a.addComponent(new SelfDestruct());
    const b = new GameObject();
    const r = b.addComponent(new Recorder());
    root.addChild(a);
    root.addChild(b);
    root.update(1);
    expect(r.log).toEqual(["init", "update"]);
  });

  it("does not call onDestroy for a component that never initialized", () => {
    const go = new GameObject();
    const r = go.addComponent(new Recorder());
    go.destroy();
    GameObject.flushDestroyed();
    expect(r.log).toEqual([]);
  });

  it("removeComponent calls onDestroy", () => {
    const go = new GameObject();
    const r = go.addComponent(new Recorder());
    go.update(1);
    go.removeComponent(Recorder);
    expect(r.log).toEqual(["init", "update", "destroy"]);
  });
});

describe("components", () => {
  it("spawner with a zero interval does not hang", () => {
    let spawned = 0;
    const go = new GameObject();
    go.addComponent(new SpawnerComponent(0, 0, 0, () => spawned++));
    go.update(1);
    expect(spawned).toBeGreaterThan(0);
    expect(spawned).toBeLessThanOrEqual(10);
  });

  it("spawner spawns on schedule", () => {
    let spawned = 0;
    const go = new GameObject();
    go.addComponent(new SpawnerComponent(1, 0, 0, () => spawned++));
    go.update(60);
    go.update(60);
    expect(spawned).toBe(2);
  });

  it("translate moves by the given amount", () => {
    const t = new TransformComponent();
    t.translate(3, 4);
    expect([t.x, t.y]).toEqual([3, 4]);
  });
});
