import { Component } from "../Component";
import { TransformComponent } from "./TransformComponent";

export type ClampEdges = {
  minX?: number;
  maxX?: number;
  minY?: number;
  maxY?: number;
};

/** Keeps the transform inside the edges that are set. Omitted axes stay free. */
export class ClampComponent extends Component {
  private readonly edges: ClampEdges;
  private transform: TransformComponent | null = null;

  constructor(edges: ClampEdges) {
    super();
    this.edges = edges;
  }

  override onInit(): void {
    if (!this.gameObject) return;
    this.transform = this.gameObject.getRequiredComponent(
      TransformComponent,
      this.constructor.name,
    );
  }

  update(_deltaTime: number): void {
    if (!this.transform) return;

    const { minX, maxX, minY, maxY } = this.edges;
    let x = this.transform.x;
    let y = this.transform.y;
    if (minX !== undefined) x = Math.max(minX, x);
    if (maxX !== undefined) x = Math.min(maxX, x);
    if (minY !== undefined) y = Math.max(minY, y);
    if (maxY !== undefined) y = Math.min(maxY, y);

    if (x !== this.transform.x || y !== this.transform.y) {
      this.transform.setPosition(x, y);
    }
  }
}
