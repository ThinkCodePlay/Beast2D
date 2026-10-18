import { describe, expect, it, vi } from "vitest";
import { GameObject } from "../src/core/GameObject";
import { InteractiveComponent } from "../src/core/components/Input/InteractiveComponent";
import { UserInputComponent } from "../src/core/components/Movement/UserInputComponent";
import { HorizontalInputComponent } from "../src/core/components/Movement/HorizontalInputComponent";
import { SpaceShootInputComponent } from "../src/core/components/Input/SpaceShootInputComponent";
import { SpawnerComponent } from "../src/core/components/Behavior/SpawnerComponent";
import { TransformComponent } from "../src/core/components/Movement/TransformComponent";
import { createRoot, frame } from "./helpers";

function key(type: "keydown" | "keyup", code: string) {
  return Object.assign(new Event(type, { cancelable: true }), { code });
}

describe("InteractiveComponent", () => {
  it("routes pointer events and cleans up", () => {
    const click = vi.fn();
    const over = vi.fn();
    const out = vi.fn();
    const root = createRoot();
    const go = new GameObject().with(
      new InteractiveComponent({
        onClick: click,
        onHoverStart: over,
        onHoverEnd: out,
        cursor: "pointer",
      }),
    );
    root.addChild(go);
    frame(root);

    expect(go.container.eventMode).toBe("static");
    expect(go.container.cursor).toBe("pointer");
    go.container.emit("pointertap", {} as never);
    go.container.emit("pointerover", {} as never);
    go.container.emit("pointerout", {} as never);
    expect([click, over, out].map((f) => f.mock.calls.length)).toEqual([1, 1, 1]);

    go.getComponent(InteractiveComponent)!.enabled = false;
    go.container.emit("pointertap", {} as never);
    expect(click).toHaveBeenCalledTimes(1);

    go.removeComponent(InteractiveComponent);
    go.getComponent(InteractiveComponent);
    go.container.emit("pointertap", {} as never);
    expect(click).toHaveBeenCalledTimes(1);
  });
});

describe("input components use the Input service", () => {
  it("UserInputComponent moves with normalized speed * delta", () => {
    const root = createRoot();
    const target = new EventTarget();
    root.context!.input.attach(target);
    const go = new GameObject()
      .with(new TransformComponent(0, 0))
      .with(new UserInputComponent(10));
    root.addChild(go);

    target.dispatchEvent(key("keydown", "ArrowRight"));
    frame(root, 1);
    expect(go.transform!.x).toBeCloseTo(10);

    target.dispatchEvent(key("keydown", "ArrowDown"));
    frame(root, 1);
    expect(go.transform!.x).toBeCloseTo(10 + 10 / Math.SQRT2);
    expect(go.transform!.y).toBeCloseTo(10 / Math.SQRT2);

    frame(root, 2);
    target.dispatchEvent(new Event("blur"));
    const x = go.transform!.x;
    frame(root, 1);
    expect(go.transform!.x).toBe(x);
  });

  it("HorizontalInputComponent moves left/right only", () => {
    const root = createRoot();
    const target = new EventTarget();
    root.context!.input.attach(target);
    const go = new GameObject()
      .with(new TransformComponent(100, 50))
      .with(new HorizontalInputComponent(4));
    root.addChild(go);

    target.dispatchEvent(key("keydown", "KeyA"));
    target.dispatchEvent(key("keydown", "ArrowUp"));
    frame(root, 2);
    expect(go.transform!.x).toBe(92);
    expect(go.transform!.y).toBe(50);
  });

  it("SpaceShootInputComponent enables the spawner while shooting", () => {
    const root = createRoot();
    const target = new EventTarget();
    root.context!.input.attach(target);
    const go = new GameObject();
    const spawner = go.addComponent(new SpawnerComponent(1, 0, 0, () => {}));
    go.addComponent(new SpaceShootInputComponent(spawner));
    root.addChild(go);

    frame(root);
    expect(spawner.enabled).toBe(false);
    target.dispatchEvent(key("keydown", "Space"));
    frame(root);
    expect(spawner.enabled).toBe(true);
    target.dispatchEvent(key("keyup", "Space"));
    frame(root);
    expect(spawner.enabled).toBe(false);
  });

  it("input components fail clearly outside a level", () => {
    const go = new GameObject()
      .with(new TransformComponent())
      .with(new UserInputComponent());
    expect(() => go.update(1)).toThrow(/EngineContext/);
  });
});
