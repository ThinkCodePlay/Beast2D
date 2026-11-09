import { describe, expect, it, vi } from "vitest";
import { GameObject } from "../src/core/GameObject";
import { Movement } from "../src/core/components/Movement/Movement";
import { KeyboardMovement } from "../src/core/components/Movement/KeyboardMovement";
import { PointerMovement } from "../src/core/components/Movement/PointerMovement";
import { TransformComponent } from "../src/core/components/Movement/TransformComponent";
import { ClampComponent } from "../src/core/components/Movement/ClampComponent";
import { pointerTarget } from "../src/core/components/Movement/pointerTarget";
import { DialogUI } from "../src/core/components/UI/DialogUI";
import { createRoot, frame } from "./helpers";

function mockCanvas() {
  const listeners = new Map<string, Set<EventListener>>();
  return {
    style: {},
    getBoundingClientRect: () => ({
      left: 0,
      top: 0,
      width: 320,
      height: 240,
      right: 320,
      bottom: 240,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    }),
    addEventListener: (type: string, handler: EventListener) => {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type)!.add(handler);
    },
    removeEventListener: (type: string, handler: EventListener) => {
      listeners.get(type)?.delete(handler);
    },
    setPointerCapture: vi.fn(),
    dispatchType: (type: string, init: Partial<PointerEvent>) => {
      const event = {
        type,
        bubbles: true,
        cancelable: true,
        button: 0,
        pointerType: "mouse",
        ...init,
      } as PointerEvent;
      for (const h of listeners.get(type) ?? []) h(event);
    },
  } as HTMLCanvasElement & {
    dispatchType: (type: string, init: Partial<PointerEvent>) => void;
  };
}

function key(type: "keydown" | "keyup", code: string) {
  return Object.assign(new Event(type, { cancelable: true }), { code });
}

describe("Movement + independent sources", () => {
  it("works when Movement is added before sources", () => {
    const root = createRoot();
    const inputTarget = new EventTarget();
    root.context!.input.attach(inputTarget);
    const player = new GameObject()
      .with(new TransformComponent(50, 10))
      .with(new Movement(10, { x: true, y: false }))
      .with(new KeyboardMovement());
    root.addChild(player);
    frame(root);
    inputTarget.dispatchEvent(key("keydown", "ArrowRight"));
    frame(root, 2);
    expect(player.transform!.x).toBeGreaterThan(50);
  });

  it("works when Movement is added after sources", () => {
    const root = createRoot();
    const inputTarget = new EventTarget();
    root.context!.input.attach(inputTarget);
    const player = new GameObject()
      .with(new TransformComponent(50, 10))
      .with(new KeyboardMovement())
      .with(new Movement(10, { x: true, y: false }));
    root.addChild(player);
    frame(root);
    inputTarget.dispatchEvent(key("keydown", "ArrowRight"));
    frame(root, 2);
    expect(player.transform!.x).toBeGreaterThan(50);
  });

  it("KeyboardMovement without Movement does not move transform", () => {
    const root = createRoot();
    const inputTarget = new EventTarget();
    root.context!.input.attach(inputTarget);
    const player = new GameObject()
      .with(new TransformComponent(40, 0))
      .with(new KeyboardMovement());
    root.addChild(player);
    frame(root);
    inputTarget.dispatchEvent(key("keydown", "ArrowRight"));
    frame(root, 3);
    expect(player.transform!.x).toBe(40);
  });

  it("combines pointer and keyboard without doubled speed", () => {
    const root = createRoot();
    const canvas = mockCanvas();
    root.context!.canvas = canvas;
    const inputTarget = new EventTarget();
    root.context!.input.attach(inputTarget);

    const player = new GameObject()
      .with(new TransformComponent(100, 50))
      .with(new KeyboardMovement())
      .with(new PointerMovement())
      .with(new Movement(10, { x: true, y: false }));
    root.addChild(player);
    frame(root);

    inputTarget.dispatchEvent(key("keydown", "ArrowRight"));
    canvas.dispatchType("pointerdown", {
      clientX: 200,
      clientY: 120,
      pointerId: 1,
    });
    frame(root, 1);
    const xBoth = player.transform!.x;
    canvas.dispatchType("pointerup", { pointerId: 1 });
    frame(root, 1);
    inputTarget.dispatchEvent(key("keydown", "ArrowRight"));
    frame(root, 1);
    const xKeyboard = player.transform!.x;
    expect(xBoth - 100).toBeLessThanOrEqual(xKeyboard - 100 + 0.01);
    player.getComponent(PointerMovement)!.onDestroy();
  });

  it("clears pointer on release and stays stable", () => {
    const root = createRoot();
    const canvas = mockCanvas();
    root.context!.canvas = canvas;

    const player = new GameObject()
      .with(new TransformComponent(50, 50))
      .with(new PointerMovement())
      .with(new Movement(10, { x: true, y: false }))
      .with(new ClampComponent({ minX: 16, maxX: 200 }));
    root.addChild(player);
    frame(root);

    canvas.dispatchType("pointerdown", {
      clientX: 280,
      clientY: 120,
      pointerId: 3,
    });
    frame(root, 10);
    expect(player.transform!.x).toBeGreaterThan(50);
    canvas.dispatchType("pointerup", { pointerId: 3 });
    const x0 = player.transform!.x;
    for (let i = 0; i < 10; i++) {
      frame(root, 1);
      expect(player.transform!.x).toBeCloseTo(x0);
    }
    player.getComponent(PointerMovement)!.onDestroy();
  });

  it("pointer converges when hold target is inside one movement step", () => {
    const root = createRoot();
    const canvas = mockCanvas();
    root.context!.canvas = canvas;

    const player = new GameObject()
      .with(new TransformComponent(50, 100))
      .with(new PointerMovement())
      .with(new Movement(10, { x: true, y: false }));
    root.addChild(player);
    frame(root);

    const rect = canvas.getBoundingClientRect();
    const targetGameX = 53;
    const clientX =
      rect.left + (targetGameX / 320) * rect.width;
    const clientY = rect.top + (100 / 240) * rect.height;

    canvas.dispatchType("pointerdown", {
      clientX,
      clientY,
      pointerId: 9,
    });
    frame(root, 2);
    expect(player.transform!.x).toBeCloseTo(targetGameX, 2);
    expect(player.transform!.x).toBeLessThanOrEqual(targetGameX);
    player.getComponent(PointerMovement)!.onDestroy();
  });

  it("ignores pointer steer while dialog open", () => {
    const root = createRoot();
    const canvas = mockCanvas();
    root.context!.canvas = canvas;
    vi.spyOn(DialogUI, "isOpen").mockReturnValue(true);

    const player = new GameObject()
      .with(new TransformComponent(80, 10))
      .with(new PointerMovement())
      .with(new Movement(8, { x: true, y: false }));
    root.addChild(player);
    frame(root);

    canvas.dispatchType("pointerdown", {
      clientX: 300,
      clientY: 120,
      pointerId: 4,
    });
    frame(root, 3);
    expect(player.transform!.x).toBe(80);
    expect(pointerTarget.getTarget()).toBeNull();
    vi.restoreAllMocks();
    player.getComponent(PointerMovement)!.onDestroy();
  });
});
