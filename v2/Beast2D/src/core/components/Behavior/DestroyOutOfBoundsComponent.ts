import { Component } from "../Component";
import { TransformComponent } from "../Movement/TransformComponent";
import { Globals } from "../../Globals";

export type DestroyBounds = {
  minX?: number;
  maxX?: number;
  minY?: number;
  maxY?: number;
};

export class DestroyOutOfBoundsComponent extends Component {
  private readonly bounds: DestroyBounds;
  private transform: TransformComponent | null = null;

  constructor(bounds: DestroyBounds = {}) {
    super();
    this.bounds = bounds;
  }

  override onInit(): void {
    if (!this.gameObject) return;
    this.transform = this.gameObject.getRequiredComponent(
      TransformComponent,
      this.constructor.name,
    );
  }

  override update(_deltaTime: number): void {
    if (!this.gameObject || !this.transform) return;

    const { x, y } = this.transform;
    const { minX, maxX, minY, maxY } = this.bounds;

    const isOutOfBounds =
      (minX !== undefined && x < minX) ||
      (maxX !== undefined && x > maxX) ||
      (minY !== undefined && y < minY) ||
      (maxY !== undefined && y > maxY);

    if (!isOutOfBounds) return;

    this.destroyGameObject();
  }

  private destroyGameObject(): void {
    this.enabled = false;
    this.gameObject?.destroy();
  }
}

export class DestroyBelowScreenComponent extends DestroyOutOfBoundsComponent {
  constructor(screenHeight: number = Globals.canvasHeight, offset: number = 0) {
    super({ maxY: screenHeight + offset });
  }
}
