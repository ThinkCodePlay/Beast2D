import { Container, type FederatedPointerEvent } from 'pixi.js';

export interface PressableOptions {
  /** Design pixels the control sinks while pressed. */
  pressDepth?: number;
  /** Color multiplier while held, for a dimmed pressed face. */
  pressTint?: number;
  /** Runs when a press starts and ends inside the control. */
  onTap?: () => void;
}

const DEFAULT_PRESS_DEPTH = 1.5;
const DEFAULT_PRESS_TINT = 0xd8cfdd;

/**
 * Push-button behavior for any control: it sinks and dims while held and
 * springs back on release, slide-off or cancel. Built on federated pointer
 * events, so mouse, touch and pen all work the same way.
 */
export function makePressable(control: Container, options: PressableOptions = {}): void {
  const pressDepth = options.pressDepth ?? DEFAULT_PRESS_DEPTH;
  const pressTint = options.pressTint ?? DEFAULT_PRESS_TINT;
  let pressed = false;

  const setPressed = (next: boolean): void => {
    if (pressed === next) return;
    pressed = next;
    control.y += pressed ? pressDepth : -pressDepth;
    control.tint = pressed ? pressTint : 0xffffff;
  };

  control.eventMode = 'static';
  control.cursor = 'pointer';
  control.on('pointerdown', () => setPressed(true));
  control.on('pointerup', () => setPressed(false));
  control.on('pointerupoutside', () => setPressed(false));
  control.on('pointercancel', () => setPressed(false));
  if (options.onTap) control.on('pointertap', () => options.onTap?.());
}

/**
 * Drag tracking for rotary controls: `onMove` runs on press and on every
 * move until release, wherever the pointer goes. The press lands on the
 * control; the stage follows the drag, so a fast flick never loses the knob.
 * Needs the stage to be hit-testable (eventMode 'static' with a hitArea).
 */
export function trackDrag(
  control: Container,
  onMove: (event: FederatedPointerEvent) => void,
  onEnd?: () => void,
): void {
  control.eventMode = 'static';
  control.cursor = 'pointer';
  control.on('pointerdown', (event: FederatedPointerEvent) => {
    const stage = rootOf(control);
    const move = (e: FederatedPointerEvent): void => onMove(e);
    const end = (): void => {
      stage.off('pointermove', move);
      stage.off('pointerup', end);
      stage.off('pointerupoutside', end);
      stage.off('pointercancel', end);
      onEnd?.();
    };
    stage.on('pointermove', move);
    stage.on('pointerup', end);
    stage.on('pointerupoutside', end);
    stage.on('pointercancel', end);
    onMove(event);
  });
}

function rootOf(container: Container): Container {
  let root = container;
  while (root.parent) root = root.parent;
  return root;
}
