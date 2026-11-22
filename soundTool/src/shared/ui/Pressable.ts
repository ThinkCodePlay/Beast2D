import { Container, type FederatedPointerEvent } from "pixi.js";

export interface PressableOptions {
  /** Design pixels the control sinks while pressed. */
  pressDepth?: number;
  /** Color multiplier while held, for a dimmed pressed face. */
  pressTint?: number;
  /** Runs when a press starts and ends inside the control. */
  onTap?: () => void;
}

/** Latch control returned by makePressable, for toggles that stay pressed. */
export interface PressableHandle {
  /** Hold or release the pressed look independently of the pointer. */
  setLatched(latched: boolean): void;
}

const DEFAULT_PRESS_DEPTH = 1.5;
const DEFAULT_PRESS_TINT = 0xd8cfdd;

/**
 * Push-button behavior for any control: it sinks and dims while held and
 * springs back on release, slide-off or cancel. A latched control keeps the
 * pressed look until the latch is released. Built on federated pointer
 * events, so mouse, touch and pen all work the same way.
 */
export function makePressable(
  control: Container,
  options: PressableOptions = {},
): PressableHandle {
  const pressDepth = options.pressDepth ?? DEFAULT_PRESS_DEPTH;
  const pressTint = options.pressTint ?? DEFAULT_PRESS_TINT;
  let held = false;
  let latched = false;
  let shown = false;

  const apply = (): void => {
    const next = held || latched;
    if (shown === next) return;
    shown = next;
    control.y += shown ? pressDepth : -pressDepth;
    control.tint = shown ? pressTint : 0xffffff;
  };

  control.eventMode = "static";
  control.cursor = "pointer";
  control.on("pointerdown", () => {
    held = true;
    apply();
  });
  const release = (): void => {
    held = false;
    apply();
  };
  control.on("pointerup", release);
  control.on("pointerupoutside", release);
  control.on("pointercancel", release);
  // The tap runs after pointerup, so re-apply once the tap had its say.
  if (options.onTap)
    control.on("pointertap", () => {
      options.onTap?.();
      apply();
    });
  return {
    setLatched(next: boolean): void {
      latched = next;
      apply();
    },
  };
}

/** Drag lifecycle: press, every move until release, and release. */
export interface DragHandlers {
  /** Runs first on press, before the first onMove (e.g. opens an edit). */
  onStart?: () => void;
  /** Runs on press and on every move until release. */
  onMove: (event: FederatedPointerEvent) => void;
  /** Runs on release, slide-off or cancel (e.g. closes an edit). */
  onEnd?: () => void;
}

/**
 * Drag tracking for rotary controls and paint grids: `onMove` runs on press
 * and on every move until release, wherever the pointer goes. The press
 * lands on the control; the stage follows the drag, so a fast flick never
 * loses the knob. Needs the stage to be hit-testable (eventMode 'static'
 * with a hitArea).
 */
export function trackDrag(control: Container, handlers: DragHandlers): void {
  control.eventMode = "static";
  control.cursor = "pointer";
  control.on("pointerdown", (event: FederatedPointerEvent) => {
    const stage = rootOf(control);
    const move = (e: FederatedPointerEvent): void => handlers.onMove(e);
    const end = (): void => {
      stage.off("pointermove", move);
      stage.off("pointerup", end);
      stage.off("pointerupoutside", end);
      stage.off("pointercancel", end);
      handlers.onEnd?.();
    };
    stage.on("pointermove", move);
    stage.on("pointerup", end);
    stage.on("pointerupoutside", end);
    stage.on("pointercancel", end);
    handlers.onStart?.();
    handlers.onMove(event);
  });
}

function rootOf(container: Container): Container {
  let root = container;
  while (root.parent) root = root.parent;
  return root;
}
