import { describe, expect, it, vi } from "vitest";
import { GameObject } from "../src/core/GameObject";
import { PlayfieldPointerTargetComponent } from "../src/core/components/Input/PlayfieldPointerTargetComponent";
import { PointerToMoveIntentComponent } from "../src/core/components/Input/PointerToMoveIntentComponent";
import { HorizontalKeyboardIntentComponent } from "../src/core/components/Movement/HorizontalKeyboardIntentComponent";
import { MoveIntentComponent } from "../src/core/components/Movement/MoveIntentComponent";
import { MoveTowardsComponent } from "../src/core/components/Movement/MoveTowardsComponent";
import { TransformComponent } from "../src/core/components/Movement/TransformComponent";
import { HorizontalClampComponent } from "../src/core/components/Movement/HorizontalClampComponent";
import { createRoot, frame } from "./helpers";
import { DialogUI } from "../src/core/components/UI/DialogUI";

function mockCanvas(): HTMLCanvasElement & {
  dispatchType: (type: string, init: Partial<PointerEvent>) => void;
} {
  const listeners = new Map<string, Set<EventListener>>();
  return {
    style: {} as CSSStyleDeclaration,
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
      for (const handler of listeners.get(type) ?? []) {
        handler(event);
      }
    },
  } as unknown as HTMLCanvasElement & {
    dispatchType: (type: string, init: Partial<PointerEvent>) => void;
  };
}

function key(type: "keydown" | "keyup", code: string) {
  return Object.assign(new Event(type, { cancelable: true }), { code });
}

describe("PlayfieldPointerTargetComponent", () => {
  it("clears target on pointer up", () => {
    const root = createRoot();
    const canvas = mockCanvas();
    root.context!.canvas = canvas;

    const pointerGo = new GameObject().with(new PlayfieldPointerTargetComponent());
    root.addChild(pointerGo);
    frame(root);

    canvas.dispatchType("pointerdown", {
      clientX: 200,
      clientY: 120,
      pointerId: 1,
    });
    const target = pointerGo.getComponent(PlayfieldPointerTargetComponent)!;
    expect(target.getMoveTarget()).not.toBeNull();

    canvas.dispatchType("pointerup", { pointerId: 1 });
    expect(target.getMoveTarget()).toBeNull();
  });

  it("ignores steering while dialog is open", () => {
    const root = createRoot();
    const canvas = mockCanvas();
    root.context!.canvas = canvas;

    vi.spyOn(DialogUI, "isOpen").mockReturnValue(true);

    const pointerGo = new GameObject().with(new PlayfieldPointerTargetComponent());
    root.addChild(pointerGo);
    frame(root);

    canvas.dispatchType("pointerdown", {
      clientX: 160,
      clientY: 120,
      pointerId: 2,
    });
    expect(pointerGo.getComponent(PlayfieldPointerTargetComponent)!.getMoveTarget()).toBeNull();
    vi.restoreAllMocks();
  });
});

describe("single movement writer via MoveIntentComponent", () => {
  it("moves toward hold target then clamp applies", () => {
    const root = createRoot();
    const canvas = mockCanvas();
    root.context!.canvas = canvas;

    const playfieldPointer = new PlayfieldPointerTargetComponent();
    const pointerGo = new GameObject().with(playfieldPointer);
    root.addChild(pointerGo);

    const player = new GameObject()
      .with(new TransformComponent(50, 100))
      .with(new MoveIntentComponent())
      .with(new PointerToMoveIntentComponent(playfieldPointer))
      .with(new MoveTowardsComponent(10, { x: true, y: false }))
      .with(new HorizontalClampComponent(16, 200));
    root.addChild(player);
    frame(root);

    canvas.dispatchType("pointerdown", {
      clientX: 300,
      clientY: 120,
      pointerId: 3,
    });
    frame(root, 10);
    expect(player.transform!.x).toBeGreaterThan(50);
    expect(player.transform!.x).toBeLessThanOrEqual(200);

    canvas.dispatchType("pointerup", { pointerId: 3 });
    const xAfterRelease = player.transform!.x;
    for (let i = 0; i < 10; i++) {
      frame(root, 1);
      expect(player.transform!.x).toBeCloseTo(xAfterRelease);
    }
  });

  it("pointer wins over keyboard; keyboard resumes after release", () => {
    const root = createRoot();
    const canvas = mockCanvas();
    const inputTarget = new EventTarget();
    root.context!.canvas = canvas;
    root.context!.input.attach(inputTarget);

    const playfieldPointer = new PlayfieldPointerTargetComponent();
    root.addChild(new GameObject().with(playfieldPointer));

    const player = new GameObject()
      .with(new TransformComponent(100, 50))
      .with(new MoveIntentComponent())
      .with(new HorizontalKeyboardIntentComponent())
      .with(new PointerToMoveIntentComponent(playfieldPointer))
      .with(new MoveTowardsComponent(10, { x: true, y: false }));
    root.addChild(player);
    frame(root);

    inputTarget.dispatchEvent(key("keydown", "ArrowRight"));
    const xBeforePointer = player.transform!.x;
    frame(root, 2);
    const xKeyboard = player.transform!.x;
    expect(xKeyboard).toBeGreaterThan(xBeforePointer);

    canvas.dispatchType("pointerdown", {
      clientX: 50,
      clientY: 120,
      pointerId: 4,
    });
    frame(root, 3);
    const xHoldLeft = player.transform!.x;
    expect(xHoldLeft).toBeLessThan(xKeyboard);

    canvas.dispatchType("pointerup", { pointerId: 4 });
    const xAfterRelease = player.transform!.x;
    frame(root, 2);
    const xKeyboardAgain = player.transform!.x;
    expect(xKeyboardAgain).toBeGreaterThan(xAfterRelease);
  });
});
