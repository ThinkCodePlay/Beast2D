import { describe, expect, it, vi } from "vitest";
import { GameObject } from "../src/core/GameObject";
import { PlayfieldPointerTargetComponent } from "../src/core/components/Input/PlayfieldPointerTargetComponent";
import { MoveTowardsComponent } from "../src/core/components/Movement/MoveTowardsComponent";
import { TransformComponent } from "../src/core/components/Movement/TransformComponent";
import { HorizontalClampComponent } from "../src/core/components/Movement/HorizontalClampComponent";
import { createRoot, frame } from "./helpers";
import { DialogUI } from "../src/core/components/UI/DialogUI";

function mockCanvas(): HTMLCanvasElement {
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
    addEventListener: (type: string, handler: EventListener, _opts?: object) => {
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
    dispatchType: (type: string, init: PointerEventInit) => void;
  };
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

describe("MoveTowardsComponent + clamp pipeline", () => {
  it("moves toward hold target then clamp applies", () => {
    const root = createRoot();
    const canvas = mockCanvas();
    root.context!.canvas = canvas;

    const pointerTarget = new PlayfieldPointerTargetComponent();
    const pointerGo = new GameObject().with(pointerTarget);
    root.addChild(pointerGo);

    const player = new GameObject()
      .with(new TransformComponent(50, 100))
      .with(new MoveTowardsComponent(10, pointerTarget, { x: true, y: false }))
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
    frame(root, 5);
    expect(player.transform!.x).toBeCloseTo(xAfterRelease);
  });
});
