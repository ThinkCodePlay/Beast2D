import { pointerTarget } from "./pointerTarget";
import { directionToPointer } from "./directionToPointer";
import { TransformComponent } from "./TransformComponent";
import { Movement } from "./Movement";
import { MovementInput } from "./MovementInput";

const DEFAULT_ARRIVE_RADIUS = 24;

/**
 * Playfield pointer hold → direction request toward logical hold position.
 * Registers shared canvas listeners via {@link pointerTarget}.
 */
export class PointerMovement extends MovementInput {
  private transform: TransformComponent | null = null;
  private arriveRadius = DEFAULT_ARRIVE_RADIUS;

  override onInit(): void {
    if (!this.gameObject) return;
    this.transform = this.gameObject.getRequiredComponent(
      TransformComponent,
      this.constructor.name,
    );
    pointerTarget.acquire(this.requireContext());
  }

  protected override computeDirection(deltaTime: number): { x: number; y: number } {
    const target = pointerTarget.getTarget();
    if (!target || !this.transform) return { x: 0, y: 0 };

    const movement = this.gameObject?.getComponent(Movement);
    const speed = movement?.speed ?? 1;
    const axes = movement?.axes ?? { x: true, y: true };
    const axisMask = {
      x: axes.x !== false,
      y: axes.y !== false,
    };

    return directionToPointer(
      this.transform.x,
      this.transform.y,
      target.x,
      target.y,
      {
        arriveRadius: this.arriveRadius,
        maxStep: speed * deltaTime,
      },
      axisMask,
    );
  }

  override onDestroy(): void {
    pointerTarget.release();
    this.transform = null;
  }
}
