import { Component } from "../Component";
import type { Input } from "../../Input";
import { RenderComponent } from "../Render/RenderComponent";

/** Flips render content horizontally to match left/right input (keeps last facing when idle). */
export class HorizontalFacingComponent extends Component {
  private render: RenderComponent | null = null;
  private input: Input | null = null;
  private facing: 1 | -1 = 1;

  override onInit(): void {
    if (!this.gameObject) return;

    this.render = this.gameObject.getComponent(RenderComponent);
    this.input = this.requireContext().input;
  }

  override update(_deltaTime: number): void {
    if (!this.render || !this.input) return;

    let direction = 0;
    if (this.input.isDown("left")) direction -= 1;
    if (this.input.isDown("right")) direction += 1;

    if (direction === 0) return;

    const nextFacing = direction > 0 ? 1 : -1;
    if (nextFacing === this.facing) return;

    this.facing = nextFacing;
    this.render.setHorizontalFacing(nextFacing);
  }

  override onDestroy(): void {
    this.render = null;
    this.input = null;
  }
}
