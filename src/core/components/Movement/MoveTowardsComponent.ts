import { Component } from "../Component";
import {
  stepMoveTowards,
  type MoveTowardsAxes,
} from "../../moveTowards";
import { TransformComponent } from "./TransformComponent";

/** Supplies a world/logical target; `null` means no active steering. */
export interface MoveTowardsTargetSource {
  getMoveTarget(): { x: number; y: number } | null;
}

/**
 * Speed-limited movement toward a target from {@link MoveTowardsTargetSource}.
 * Clamps via separate components (e.g. {@link HorizontalClampComponent}) in the
 * normal update order — this does not bypass the movement pipeline.
 */
export class MoveTowardsComponent extends Component {
  private transform: TransformComponent | null = null;
  readonly speed: number;
  readonly source: MoveTowardsTargetSource;
  readonly axes: MoveTowardsAxes;

  constructor(
    speed: number,
    source: MoveTowardsTargetSource,
    axes: MoveTowardsAxes = { x: true, y: true },
  ) {
    super();
    this.speed = speed;
    this.source = source;
    this.axes = axes;
  }

  hasActiveTarget(): boolean {
    return this.source.getMoveTarget() !== null;
  }

  override onInit(): void {
    if (!this.gameObject) return;
    this.transform = this.gameObject.getRequiredComponent(
      TransformComponent,
      this.constructor.name,
    );
  }

  override update(deltaTime: number): void {
    const target = this.source.getMoveTarget();
    if (!target || !this.transform) return;

    const maxStep = this.speed * deltaTime;
    const next = stepMoveTowards(
      { x: this.transform.x, y: this.transform.y },
      target,
      maxStep,
      this.axes,
    );
    this.transform.setPosition(next.x, next.y);
  }

  override onDestroy(): void {
    this.transform = null;
  }
}
