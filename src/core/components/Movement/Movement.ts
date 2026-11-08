import { Component } from "../Component";
import { combineDirections } from "../../movement/combineDirections";
import type { MoveTowardsAxes } from "../../moveTowards";
import { TransformComponent } from "./TransformComponent";
import { MovementDirectionSource } from "./MovementDirectionSource";

/**
 * Applies summed movement requests from {@link MovementDirectionSource} siblings
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
      .getComponents(MovementDirectionSource)
      .filter((src) => src.enabled && !src.destroyed);
    if (sources.length === 0) return;

    for (const src of sources) {
      src.prepareDirection(deltaTime);
    }
    const requests = sources.map((src) => src.getMovementDirection());

    let combined = combineDirections(requests);
    if (this.axes.x === false) combined = { ...combined, x: 0 };
    if (this.axes.y === false) combined = { ...combined, y: 0 };

    const mag = Math.hypot(combined.x, combined.y);
    if (mag === 0) return;

    const step = this.speed * deltaTime;
    this.transform.translate(combined.x * step, combined.y * step);
  }

  override onDestroy(): void {
    this.transform = null;
  }
}
