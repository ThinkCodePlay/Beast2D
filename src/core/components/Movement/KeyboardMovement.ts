import type { Input } from "../../Input";
import { MovementDirectionSource } from "./MovementDirectionSource";

/** Horizontal keyboard actions → movement request (no transform writes). */
export class KeyboardMovement extends MovementDirectionSource {
  private input: Input | null = null;

  override onInit(): void {
    this.input = this.requireContext().input;
  }

  protected override computeDirection(_deltaTime: number): { x: number; y: number } {
    if (!this.input) return { x: 0, y: 0 };

    let direction = 0;
    if (this.input.isDown("left")) direction -= 1;
    if (this.input.isDown("right")) direction += 1;
    return { x: direction, y: 0 };
  }

  override onDestroy(): void {
    this.input = null;
  }
}
