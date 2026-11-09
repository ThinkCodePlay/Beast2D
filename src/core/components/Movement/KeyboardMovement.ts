import type { Input } from "../../Input";
import { MovementInput } from "./MovementInput";

/** Arrow / WASD actions → movement request. {@link Movement} applies it and can lock an axis. */
export class KeyboardMovement extends MovementInput {
  private input: Input | null = null;

  override onInit(): void {
    this.input = this.requireContext().input;
  }

  protected override computeDirection(_deltaTime: number): { x: number; y: number } {
    if (!this.input) return { x: 0, y: 0 };

    let x = 0;
    let y = 0;
    if (this.input.isDown("left")) x -= 1;
    if (this.input.isDown("right")) x += 1;
    if (this.input.isDown("up")) y -= 1;
    if (this.input.isDown("down")) y += 1;
    return { x, y };
  }

  override onDestroy(): void {
    this.input = null;
  }
}
