import { Component } from "../Component";
import type { Input } from "../../Input";
import { TransformComponent } from "./TransformComponent";

/** Moves the GameObject left/right using the left/right input actions. */
export class HorizontalInputComponent extends Component {
  speed: number;
  private transform: TransformComponent | null = null;
  private input: Input | null = null;

  constructor(speed: number = 6) {
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

    let direction = 0;
    if (this.input.isDown("left")) direction -= 1;
    if (this.input.isDown("right")) direction += 1;

    if (direction !== 0) {
      this.transform.translate(direction * this.speed * deltaTime, 0);
    }
  }

  override onDestroy(): void {
    this.transform = null;
    this.input = null;
  }
}
