import { describe, expect, it, vi } from "vitest";
import { GameObject } from "../src/core/GameObject";
import { ClickableComponent } from "../src/core/components/Input/ClickableComponent";
import { Movement } from "../src/core/components/Movement/Movement";
import { KeyboardMovement } from "../src/core/components/Movement/KeyboardMovement";
import { HorizontalFacingComponent } from "../src/game/Bunny Hop/components/HorizontalFacingComponent";
import { HorizontalLocomotionAnimationComponent } from "../src/game/Bunny Hop/components/HorizontalLocomotionAnimationComponent";
import {
  SpriteAnimationComponent,
  type SpritesheetAnimationClipsOptions,
} from "../src/core/components/Render/SpriteAnimationComponent";
import { SpaceShootInputComponent } from "../src/game/Space Shooter/components/SpaceShootInputComponent";
import { SpawnerComponent } from "../src/core/components/Behavior/SpawnerComponent";
import { TransformComponent } from "../src/core/components/Movement/TransformComponent";
import { RenderComponent } from "../src/core/components/Render/RenderComponent";
import { Graphics } from "pixi.js";
import { createRoot, frame } from "./helpers";

class RecordingSpritesheetAnimation extends SpriteAnimationComponent {
  played: string[] = [];

  constructor(options: SpritesheetAnimationClipsOptions) {
    super(options);
  }

  override playClip(name: string, options?: { restart?: boolean }): void {
    this.played.push(name);
    super.playClip(name, options);
  }
}

class FlipProbeRender extends RenderComponent {
  facing: 1 | -1 = 1;

  createGraphics(): Graphics {
    return new Graphics();
  }

  override setHorizontalFacing(direction: 1 | -1): void {
    this.facing = direction;
  }
}

function key(type: "keydown" | "keyup", code: string) {
  return Object.assign(new Event(type, { cancelable: true }), { code });
}

describe("ClickableComponent", () => {
  it("routes pointer events and cleans up", () => {
    const click = vi.fn();
    const over = vi.fn();
    const out = vi.fn();
    const root = createRoot();
    const go = new GameObject().with(
      new ClickableComponent({
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

    go.getComponent(ClickableComponent)!.enabled = false;
    go.container.emit("pointertap", {} as never);
    expect(click).toHaveBeenCalledTimes(1);

    go.removeComponent(ClickableComponent);
    go.getComponent(ClickableComponent);
    go.container.emit("pointertap", {} as never);
    expect(click).toHaveBeenCalledTimes(1);
  });
});

describe("input components use the Input service", () => {
  it("KeyboardMovement moves with normalized speed * delta", () => {
    const root = createRoot();
    const target = new EventTarget();
    root.context!.input.attach(target);
    const go = new GameObject()
      .with(new TransformComponent(0, 0))
      .with(new Movement(10))
      .with(new KeyboardMovement());
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

  it("Movement can lock to the x axis", () => {
    const root = createRoot();
    const target = new EventTarget();
    root.context!.input.attach(target);
    const go = new GameObject()
      .with(new TransformComponent(100, 50))
      .with(new Movement(4, { x: true, y: false }))
      .with(new KeyboardMovement());
    root.addChild(go);

    target.dispatchEvent(key("keydown", "KeyA"));
    target.dispatchEvent(key("keydown", "ArrowUp"));
    frame(root, 2);
    expect(go.transform!.x).toBe(92);
    expect(go.transform!.y).toBe(50);
  });

  it("HorizontalFacingComponent flips render without moving transform", () => {
    const root = createRoot();
    const target = new EventTarget();
    root.context!.input.attach(target);
    const render = new FlipProbeRender();
    const go = new GameObject()
      .with(new TransformComponent(100, 50))
      .with(render)
      .with(new HorizontalFacingComponent());
    root.addChild(go);

    target.dispatchEvent(key("keydown", "ArrowLeft"));
    frame(root, 1);
    expect(render.facing).toBe(-1);
    expect(go.transform!.x).toBe(100);
    expect(go.transform!.scaleX).toBe(1);

    target.dispatchEvent(key("keyup", "ArrowLeft"));
    target.dispatchEvent(key("keydown", "ArrowRight"));
    frame(root, 1);
    expect(render.facing).toBe(1);
    expect(go.transform!.x).toBe(100);
  });

  it("HorizontalLocomotionAnimationComponent switches idle and walk clips", () => {
    const root = createRoot();
    const target = new EventTarget();
    root.context!.input.attach(target);
    const render = new RecordingSpritesheetAnimation({
      defaultClip: "idle",
      clips: {
        idle: {
          texturePath: "idle.png",
          frameWidth: 64,
          frameHeight: 64,
          columns: 1,
          frameCount: 1,
        },
        walk: {
          texturePath: "walk.png",
          frameWidth: 64,
          frameHeight: 64,
          columns: 1,
          frameCount: 1,
        },
      },
    });
    const go = new GameObject()
      .with(render)
      .with(new HorizontalLocomotionAnimationComponent());
    root.addChild(go);
    frame(root);
    expect(render.played.at(-1)).toBe("idle");

    target.dispatchEvent(key("keydown", "ArrowRight"));
    frame(root, 1);
    expect(render.played.at(-1)).toBe("walk");

    target.dispatchEvent(key("keyup", "ArrowRight"));
    frame(root, 1);
    expect(render.played.at(-1)).toBe("idle");
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
      .with(new KeyboardMovement());
    expect(() => go.update(1)).toThrow(/EngineContext/);
  });
});
