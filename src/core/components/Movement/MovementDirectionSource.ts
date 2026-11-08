import { Component } from "../Component";

/**
 * Per-frame movement request in normalized analog space (typically |v| ≤ 1).
 * {@link Movement} calls {@link prepareDirection} before applying motion.
 */
export abstract class MovementDirectionSource extends Component {
  private readonly direction = { x: 0, y: 0 };

  /** Refreshes cached direction for this frame (invoked by {@link Movement}). */
  prepareDirection(deltaTime: number): void {
    const next = this.computeDirection(deltaTime);
    this.direction.x = next.x;
    this.direction.y = next.y;
  }

  getMovementDirection(): { x: number; y: number } {
    return this.direction;
  }

  protected abstract computeDirection(deltaTime: number): { x: number; y: number };

  override onDestroy(): void {
    this.direction.x = 0;
    this.direction.y = 0;
  }
}
