import { Graphics } from "pixi.js";
import {
  ColliderComponent,
  type ColliderOptions,
  type ColliderShape,
} from "./ColliderComponent";
import { Globals } from "../../Globals";

interface ColliderDebugOptions {
  color?: number;
  lineWidth?: number;
  alpha?: number;
  hitColor?: number;
}

export class CircleColliderComponent extends ColliderComponent {
  private graphics: Graphics | null = null;
  private radius: number;
  private options: Required<ColliderDebugOptions>;
  private normalColor: number;
  private isHighlighted: boolean = false;

  constructor(
    radius: number,
    collisionOptions: ColliderOptions = {},
    debugOptions: ColliderDebugOptions = {},
  ) {
    super(collisionOptions);
    this.radius = radius;
    this.options = {
      color: debugOptions.color ?? 0x00ff66,
      lineWidth: debugOptions.lineWidth ?? 1,
      alpha: debugOptions.alpha ?? 0.9,
      hitColor: debugOptions.hitColor ?? 0xff0000,
    };
    this.normalColor = this.options.color;
  }

  override init(): void {
    super.init();
    if (!this.gameObject) return;

    this.graphics = new Graphics()
      .circle(this.radius, this.radius, this.radius)
      .stroke({
        color: this.options.color,
        width: this.options.lineWidth,
      });

    this.graphics.alpha = this.options.alpha;
    this.graphics.visible = Globals.debug;
    this.gameObject.container.addChild(this.graphics);
    this.syncToTransform();
  }

  override update(_deltaTime: number): void {
    super.update(_deltaTime);
    if (!this.graphics) return;
    this.graphics.visible = Globals.debug;
    this.updateCollisionHighlight();
    this.syncToTransform();
  }

  private updateCollisionHighlight(): void {
    if (!this.graphics || !Globals.debug) return;

    const shouldHighlight = this.isColliding;

    if (shouldHighlight !== this.isHighlighted) {
      this.isHighlighted = shouldHighlight;
      const targetColor = shouldHighlight
        ? this.options.hitColor
        : this.normalColor;

      this.graphics.clear();
      this.graphics.circle(this.radius, this.radius, this.radius).stroke({
        color: targetColor,
        width: this.options.lineWidth,
      });
    }
  }

  protected override getShape(): ColliderShape | null {
    if (!this.transform) return null;

    const radiusScale =
      (Math.abs(this.transform.scaleX) + Math.abs(this.transform.scaleY)) / 2;
    return {
      type: "circle",
      x: this.transform.x + this.radius * this.transform.scaleX,
      y: this.transform.y + this.radius * this.transform.scaleY,
      radius: this.radius * radiusScale,
    };
  }

  private syncToTransform(): void {
    if (!this.graphics || !this.transform) return;

    this.graphics.x = this.transform.x;
    this.graphics.y = this.transform.y;
    this.graphics.rotation = this.transform.rotation;
    this.graphics.scale.set(this.transform.scaleX, this.transform.scaleY);
  }

  override destroy(): void {
    if (this.graphics && this.gameObject) {
      this.gameObject.container.removeChild(this.graphics);
      this.graphics.destroy();
      this.graphics = null;
    }
    super.destroy();
  }
}
