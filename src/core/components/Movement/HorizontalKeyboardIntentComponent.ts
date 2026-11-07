import { Component } from "../Component";
import type { Input } from "../../Input";
import { MoveIntentComponent } from "./MoveIntentComponent";

/** Writes left/right keyboard into {@link MoveIntentComponent} (no transform). */
export class HorizontalKeyboardIntentComponent extends Component {
  private input: Input | null = null;
  private intent: MoveIntentComponent | null = null;

  override onInit(): void {
    if (!this.gameObject) return;
    this.intent = this.gameObject.getRequiredComponent(
      MoveIntentComponent,
      this.constructor.name,
    );
    this.input = this.requireContext().input;
  }

  override update(_deltaTime: number): void {
    if (!this.intent || !this.input) return;

    let direction = 0;
    if (this.input.isDown("left")) direction -= 1;
    if (this.input.isDown("right")) direction += 1;
    this.intent.keyboardAxisX = direction;
  }

  override onDestroy(): void {
    this.input = null;
    this.intent = null;
  }
}
