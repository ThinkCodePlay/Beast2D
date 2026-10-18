import { Graphics } from "pixi.js";
import { Component } from "../Component";
import { TransformComponent } from "../Movement/TransformComponent";
import { CollisionLayers, ColliderModes } from "../../consts";
import type { ColliderShape } from "./shapes";

export type { ColliderShape } from "./shapes";
export type ColliderMode = (typeof ColliderModes)[keyof typeof ColliderModes];
export type CollisionLayer =
  (typeof CollisionLayers)[keyof typeof CollisionLayers];

export type CollisionHandler = (
  self: ColliderComponent,
  other: ColliderComponent,
) => void;

export interface ColliderOptions {
  layer?: CollisionLayer;
  mode?: ColliderMode;
  mask?: CollisionLayer[];
  onCollisionEnter?: CollisionHandler;
  onCollisionStay?: CollisionHandler;
  onCollisionExit?: CollisionHandler;
}

export interface ColliderDebugOptions {
  color?: number;
  lineWidth?: number;
  alpha?: number;
  hitColor?: number;
}

/* ColliderComponent
  Describes a collider (layer, mode, mask, callbacks). The actual checks are
  done by the CollisionSystem of the engine context. Debug outlines are drawn
  as a child of the GameObject container, so they follow its transform.
*/
export abstract class ColliderComponent extends Component {
  readonly layer: CollisionLayer;
  readonly mode: ColliderMode;
  readonly mask: CollisionLayer[];
  readonly onCollisionEnter?: CollisionHandler;
  readonly onCollisionStay?: CollisionHandler;
  readonly onCollisionExit?: CollisionHandler;

  /** True while an active collider overlaps at least one other collider. */
  isColliding: boolean = false;

  protected transform: TransformComponent | null = null;
  private readonly debugOptions: Required<ColliderDebugOptions>;
  private debugGraphics: Graphics | null = null;
  private highlighted: boolean = false;

  constructor(
    options: ColliderOptions = {},
    debugOptions: ColliderDebugOptions = {},
  ) {
    super();
    this.layer = options.layer ?? CollisionLayers.Default;
    this.mode = options.mode ?? ColliderModes.Passive;
    this.mask = options.mask ?? [];
    this.onCollisionEnter = options.onCollisionEnter;
    this.onCollisionStay = options.onCollisionStay;
    this.onCollisionExit = options.onCollisionExit;
    this.debugOptions = {
      color: debugOptions.color ?? 0x00ff66,
      lineWidth: debugOptions.lineWidth ?? 1,
      alpha: debugOptions.alpha ?? 0.9,
      hitColor: debugOptions.hitColor ?? 0xff0000,
    };
  }

  /** Shape in world space, or null if it cannot be computed. */
  abstract getShape(): ColliderShape | null;

  /** Draws the outline in the GameObject's local space. */
  protected abstract drawDebugShape(graphics: Graphics, color: number): void;

  override onInit(): void {
    if (!this.gameObject) return;

    this.transform = this.gameObject.getComponent(TransformComponent);
    this.gameObject.context?.collisions.register(this);

    this.debugGraphics = new Graphics();
    this.debugGraphics.alpha = this.debugOptions.alpha;
    this.drawDebug(this.debugOptions.color);
    this.gameObject.container.addChild(this.debugGraphics);
    this.updateDebugVisibility();
  }

  override update(_deltaTime: number): void {
    this.updateDebugVisibility();
    if (!this.debugGraphics || !this.debugGraphics.visible) return;

    if (this.isColliding !== this.highlighted) {
      this.highlighted = this.isColliding;
      this.drawDebug(
        this.highlighted ? this.debugOptions.hitColor : this.debugOptions.color,
      );
    }
  }

  override onDestroy(): void {
    this.gameObject?.context?.collisions.unregister(this);
    if (this.debugGraphics) {
      this.debugGraphics.destroy();
      this.debugGraphics = null;
    }
    this.isColliding = false;
  }

  isActiveMode(): boolean {
    return this.mode === ColliderModes.Active || this.mode === ColliderModes.Both;
  }

  isPassiveMode(): boolean {
    return (
      this.mode === ColliderModes.Passive || this.mode === ColliderModes.Both
    );
  }

  /** Enabled and attached to a live GameObject. */
  isLive(): boolean {
    return this.enabled && !this.isDestroyedOrGone();
  }

  isDestroyedOrGone(): boolean {
    return this.destroyed || !this.gameObject || this.gameObject.destroyed;
  }

  /** Whether this collider wants to be notified about `other`. */
  accepts(other: ColliderComponent): boolean {
    if (other === this) return false;
    if (!this.isLive() || !other.isLive()) return false;
    if (!other.isPassiveMode()) return false;
    if (this.mask.length > 0 && !this.mask.includes(other.layer)) return false;
    return true;
  }

  private drawDebug(color: number): void {
    if (!this.debugGraphics) return;
    this.debugGraphics.clear();
    this.drawDebugShape(this.debugGraphics, color);
    this.debugGraphics.stroke({
      color,
      width: this.debugOptions.lineWidth,
    });
  }

  private updateDebugVisibility(): void {
    if (!this.debugGraphics) return;
    this.debugGraphics.visible = this.gameObject?.context?.debug ?? true;
  }
}
