import { Graphics, Sprite, Container } from "pixi.js";
import { Component } from "../Component";

export interface RenderOptions {
  color?: number;
  strokeColor?: number;
  strokeWidth?: number;
  alpha?: number;
  visible?: boolean;
}

export abstract class RenderComponent extends Component {
  protected graphics: Graphics | Sprite | null = null;
  protected container: Container | null = null;
  renderOptions: RenderOptions;

  constructor(renderOptions: RenderOptions = {}) {
    super();
    this.renderOptions = {
      color: 0x00ccff,
      strokeColor: 0x00334d,
      strokeWidth: 2,
      alpha: 1,
      visible: true,
      ...renderOptions,
    };
  }

  // Graphics are drawn at the GameObject origin; the TransformComponent
  // positions the GameObject container itself.
  abstract createGraphics(): Graphics | Sprite;

  override onInit(): void {
    if (!this.gameObject) return;

    this.container = this.gameObject.container;
    this.graphics = this.createGraphics();

    this.graphics.alpha = this.renderOptions.alpha ?? 1;
    this.graphics.visible = this.renderOptions.visible ?? true;

    this.container.addChild(this.graphics);
  }

  setRenderOptions(options: Partial<RenderOptions>): void {
    this.renderOptions = { ...this.renderOptions, ...options };
    if (this.graphics && this.container) {
      this.container.removeChild(this.graphics);
      this.graphics.destroy();
      this.onInit();
    }
  }

  override onDestroy(): void {
    if (this.graphics && this.container) {
      this.container.removeChild(this.graphics);
      this.graphics.destroy();
      this.graphics = null;
    }
  }
}
