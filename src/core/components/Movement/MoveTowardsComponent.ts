import { Component } from "../Component";
import {
  stepMoveTowards,
  type MoveTowardsAxes,
} from "../../moveTowards";
import { MoveIntentComponent } from "./MoveIntentComponent";
import { TransformComponent } from "./TransformComponent";

/**
 * Sole movement writer for objects using {@link MoveIntentComponent}.
 * Pointer hold moves toward `pointerTarget` on masked axes; otherwise
 * applies keyboard axis at speed. Clamps via siblings such as
 * {@link HorizontalClampComponent}.
 */
export class MoveTowardsComponent extends Component {
  private transform: TransformComponent | null = null;
  readonly speed: number;
  readonly axes: MoveTowardsAxes;

  constructor(
    speed: number,
    axes: MoveTowardsAxes = { x: true, y: true },
  ) {
    super();
    this.speed = speed;
    this.axes = axes;
  }

  override onInit(): void {
    if (!this.gameObject) return;
    this.transform = this.gameObject.getRequiredComponent(
      TransformComponent,
      this.constructor.name,
    );
    this.gameObject.getRequiredComponent(MoveIntentComponent, this.constructor.name);
  }

  override update(deltaTime: number): void {
    if (!this.transform || !this.gameObject) return;

    const intent = this.gameObject.getRequiredComponent(MoveIntentComponent);
    const maxStep = this.speed * deltaTime;

    if (intent.pointerTarget) {
      const next = stepMoveTowards(
        { x: this.transform.x, y: this.transform.y },
        intent.pointerTarget,
        maxStep,
        this.axes,
      );
      this.transform.setPosition(next.x, next.y);
      return;
    }

    const dx = this.axes.x !== false ? intent.keyboardAxisX : 0;
    const dy = this.axes.y !== false ? intent.keyboardAxisY : 0;
    if (dx === 0 && dy === 0) return;

    if (dx !== 0 && dy !== 0) {
      const scale = maxStep / Math.hypot(dx, dy);
      this.transform.translate(dx * scale, dy * scale);
    } else {
      this.transform.translate(dx * maxStep, dy * maxStep);
    }
  }

  override onDestroy(): void {
    this.transform = null;
  }
}
