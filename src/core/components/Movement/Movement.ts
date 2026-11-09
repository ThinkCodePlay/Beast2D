import { Component } from "../Component";
import { combineDirections } from "./combineDirections";
import type { MoveTowardsAxes } from "./stepToward";
import { TransformComponent } from "./TransformComponent";
import { MovementInput } from "./MovementInput";

/**
 * Applies summed movement requests from {@link MovementInput} siblings
 * on the same GameObject. Requests are combined by vector sum with magnitude
 * clamped to 1; this component is the only transform writer for that path.
 */
export class Movement extends Component {
  private transform: TransformComponent | null = null;
  readonly speed: number;
  readonly axes: MoveTowardsAxes;

  constructor(speed: number, axes: MoveTowardsAxes = { x: true, y: true }) {
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
  }

  override update(deltaTime: number): void {
    if (!this.transform || !this.gameObject) return;

    const sources = this.gameObject
      .getComponents(MovementInput)
      .filter((src) => src.enabled && !src.destroyed);
    if (sources.length === 0) return;

    for (const src of sources) {
      src.prepareDirection(deltaTime);
    }
    const requests = sources.map((src) => {
      const direction = src.getMovementDirection();
      return {
        x: this.axes.x === false ? 0 : direction.x,
        y: this.axes.y === false ? 0 : direction.y,
      };
    });

    const combined = combineDirections(requests);

    const mag = Math.hypot(combined.x, combined.y);
    if (mag === 0) return;

    const step = this.speed * deltaTime;
    this.transform.translate(combined.x * step, combined.y * step);
  }

  override onDestroy(): void {
    this.transform = null;
  }
}
