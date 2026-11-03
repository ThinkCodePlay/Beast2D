import { Component } from "../Component";
import type { Input } from "../../Input";
import { SpritesheetAnimationRenderComponent } from "../Render/SpritesheetAnimationRenderComponent";

/** Plays walk while left/right is held, idle otherwise. */
export class HorizontalLocomotionAnimationComponent extends Component {
  private render: SpritesheetAnimationRenderComponent | null = null;
  private input: Input | null = null;
  private moving = false;
  private readonly idleClip: string;
  private readonly walkClip: string;

  constructor(idleClip = "idle", walkClip = "walk") {
    super();
    this.idleClip = idleClip;
    this.walkClip = walkClip;
  }

  override onInit(): void {
    if (!this.gameObject) return;

    this.render = this.gameObject.getRequiredComponent(
      SpritesheetAnimationRenderComponent,
      this.constructor.name,
    );
    this.input = this.requireContext().input;
    this.syncClip();
  }

  override update(_deltaTime: number): void {
    if (!this.render || !this.input) return;

    const moving =
      this.input.isDown("left") || this.input.isDown("right");
    if (moving === this.moving) return;

    this.moving = moving;
    this.syncClip();
  }

  private syncClip(): void {
    this.render?.playClip(this.moving ? this.walkClip : this.idleClip);
  }

  override onDestroy(): void {
    this.render = null;
    this.input = null;
  }
}
