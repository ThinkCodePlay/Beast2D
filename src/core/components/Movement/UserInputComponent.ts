import { Component } from "../Component";
import type { Input } from "../../Input";
import { TransformComponent } from "./TransformComponent";

/** Moves the GameObject in 4 directions using the left/right/up/down actions. */
export class UserInputComponent extends Component {
  speed: number;
  private transform: TransformComponent | null = null;
  private input: Input | null = null;

  constructor(speed: number = 5) {
    super();
    this.speed = speed;
  }

  override onInit(): void {
    if (!this.gameObject) return;

    this.transform = this.gameObject.getRequiredComponent(
      TransformComponent,
      this.constructor.name,
    );
    this.input = this.requireContext().input;
  }

  override update(deltaTime: number): void {
    if (!this.transform || !this.input) return;

    let dx = 0;
    let dy = 0;
    if (this.input.isDown("up")) dy -= 1;
    if (this.input.isDown("down")) dy += 1;
    if (this.input.isDown("left")) dx -= 1;
    if (this.input.isDown("right")) dx += 1;

    if (dx === 0 && dy === 0) return;

    // Normalize so diagonal movement is not faster
    const scale = (this.speed * deltaTime) / Math.hypot(dx, dy);
    this.transform.translate(dx * scale, dy * scale);
  }

  override onDestroy(): void {
    this.transform = null;
    this.input = null;
  }
}
