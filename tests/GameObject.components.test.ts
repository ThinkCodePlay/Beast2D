import { describe, expect, it, vi } from "vitest";
import { GameObject } from "../src/core/GameObject";
import { Component } from "../src/core/components/Component";
import { TransformComponent } from "../src/core/components/Movement/TransformComponent";
import { createContext, createRoot, frame } from "./helpers";

class Base extends Component {}
class Derived extends Base {}
class Other extends Component {}

describe("component lookup", () => {
  it("finds components by class reference", () => {
    const go = new GameObject();
    const derived = go.addComponent(new Derived());
    expect(go.getComponent(Derived)).toBe(derived);
    expect(go.hasComponent(Other)).toBe(false);
    expect(go.getComponent(Other)).toBeNull();
  });

  it("finds a subclass through its base class", () => {
    const go = new GameObject();
    const derived = go.addComponent(new Derived());
    expect(go.getComponent(Base)).toBe(derived);
    expect(go.getComponents(Base)).toEqual([derived]);
  });

  it("returns the existing instance and warns on duplicates", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const go = new GameObject();
    const first = go.addComponent(new Other());
    expect(go.addComponent(new Other())).toBe(first);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it("getRequiredComponent throws a descriptive error", () => {
    const go = new GameObject();
    expect(() => go.getRequiredComponent(Other, "Tester")).toThrow(
      /Other is required for Tester/,
    );
  });

  it("with() adds components fluently", () => {
    const go = new GameObject().with(new Base()).with(new Other());
    expect(go.hasComponent(Base)).toBe(true);
    expect(go.hasComponent(Other)).toBe(true);
  });
});

describe("context, root and pause", () => {
  it("children inherit the context and root", () => {
    const root = createRoot();
    const child = new GameObject();
    const grandChild = new GameObject();
    root.addChild(child);
    child.addChild(grandChild);
    expect(grandChild.context).toBe(root.context);
    expect(grandChild.root).toBe(root);
  });

  it("a detached object has no context", () => {
    expect(new GameObject().context).toBeNull();
  });

  it("components can read the context and require it", () => {
    class Needs extends Component {
      override onInit() {
        this.requireContext();
      }
    }
    expect(() => {
      const go = new GameObject();
      go.addComponent(new Needs());
      go.update(1);
    }).toThrow(/needs an EngineContext/);

    const root = createRoot();
    const go = new GameObject();
    go.addComponent(new Needs());
    root.addChild(go);
    expect(() => frame(root)).not.toThrow();
  });

  it("skips component updates while paused unless runWhenPaused", () => {
    const context = createContext();
    const root = createRoot(context);
    let gameTicks = 0;
    let uiTicks = 0;
    class Count extends Component {
      constructor(private fn: () => void) {
        super();
      }
      override update() {
        this.fn();
      }
    }
    const game = new GameObject().with(new Count(() => gameTicks++));
    const ui = new GameObject().with(new Count(() => uiTicks++));
    ui.runWhenPaused = true;
    root.addChild(game);
    root.addChild(ui);

    frame(root);
    context.time.paused = true;
    frame(root);
    frame(root);

    expect(gameTicks).toBe(1);
    expect(uiTicks).toBe(3);
  });

  it("still updates children of a paused object", () => {
    const context = createContext();
    const root = createRoot(context);
    let ticks = 0;
    class Count extends Component {
      override update() {
        ticks++;
      }
    }
    const paused = new GameObject();
    const ui = new GameObject().with(new Count());
    ui.runWhenPaused = true;
    paused.addChild(ui);
    root.addChild(paused);

    context.time.paused = true;
    frame(root);
    expect(ticks).toBe(1);
  });
});

describe("transforms and the scene graph", () => {
  it("getWorldPosition composes parent transforms", () => {
    const parent = new GameObject().with(new TransformComponent(100, 50));
    const child = new GameObject().with(new TransformComponent(10, 5));
    parent.addChild(child);
    expect(child.getWorldPosition()).toEqual({ x: 110, y: 55 });
  });

  it("a child without a transform reports its parent's position", () => {
    const parent = new GameObject().with(new TransformComponent(7, 8));
    const child = new GameObject();
    parent.addChild(child);
    expect(child.getWorldPosition()).toEqual({ x: 7, y: 8 });
  });

  it("syncTransforms writes transforms to containers (children inherit)", () => {
    const root = createRoot();
    const parent = new GameObject().with(new TransformComponent(100, 50));
    const child = new GameObject().with(new TransformComponent(10, 5));
    parent.addChild(child);
    root.addChild(parent);

    parent.transform!.setRotation(0.5);
    parent.transform!.setScale(2);
    frame(root);

    expect(parent.container.position.x).toBe(100);
    expect(parent.container.rotation).toBe(0.5);
    expect(parent.container.scale.x).toBe(2);
    expect(child.container.position.x).toBe(10);
    expect(child.container.parent).toBe(parent.container);
  });

  it("movement in update is visible on the container the same frame", () => {
    const root = createRoot();
    class Mover extends Component {
      override update() {
        this.gameObject!.transform!.translate(5, 0);
      }
    }
    const go = new GameObject()
      .with(new TransformComponent(0, 0))
      .with(new Mover());
    root.addChild(go);
    frame(root);
    expect(go.container.position.x).toBe(5);
  });
});
