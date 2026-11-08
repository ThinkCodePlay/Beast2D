import { playfieldPointerSession } from "../../pointer/playfieldPointerSession";
import { pointerArrivalDirection } from "../../movement/pointerArrivalDirection";
import { TransformComponent } from "./TransformComponent";
import { Movement } from "./Movement";
import { MovementDirectionSource } from "./MovementDirectionSource";

const DEFAULT_ARRIVE_RADIUS = 24;

/**
 * Playfield pointer hold → direction request toward logical hold position.
 * Registers shared canvas listeners via {@link playfieldPointerSession}.
 */
export class PointerMovement extends MovementDirectionSource {
  private transform: TransformComponent | null = null;
  private arriveRadius = DEFAULT_ARRIVE_RADIUS;

  override onInit(): void {
    if (!this.gameObject) return;
    this.transform = this.gameObject.getRequiredComponent(
      TransformComponent,
      this.constructor.name,
    );
    playfieldPointerSession.acquire(this.requireContext());
  }

  protected override computeDirection(deltaTime: number): { x: number; y: number } {
    const target = playfieldPointerSession.getTarget();
    if (!target || !this.transform) return { x: 0, y: 0 };

    const movement = this.gameObject?.getComponent(Movement);
    const speed = movement?.speed ?? 1;
    const axes = movement?.axes ?? { x: true, y: true };
    const axisMask = {
      x: axes.x !== false,
      y: axes.y !== false,
    };

    return pointerArrivalDirection(
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
    playfieldPointerSession.release();
    this.transform = null;
  }
}
