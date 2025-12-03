import { Graphics, Container } from "pixi.js";
import { Component } from "./Component";

export interface RenderOptions {
  color?: number;
  strokeColor?: number;
  strokeWidth?: number;
  alpha?: number;
  visible?: boolean;
}

export abstract class RenderComponent extends Component {
  protected graphics: Graphics | null = null;
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

  abstract createGraphics(): Graphics;

  override init(): void {
    if (!this.gameObject) return;
    
    this.container = this.gameObject.container;
    this.graphics = this.createGraphics();
    
    this.updateTransform();
    this.graphics.alpha = this.renderOptions.alpha ?? 1;
    this.graphics.visible = this.renderOptions.visible ?? true;
    
    this.container.addChild(this.graphics);
  }

  override update(_deltaTime: number): void {
    this.updateTransform();
  }

  protected updateTransform(): void {
    if (!this.graphics || !this.gameObject) return;
    
    this.graphics.x = this.gameObject.x;
    this.graphics.y = this.gameObject.y;
    this.graphics.rotation = this.gameObject.rotation;
    this.graphics.scale.set(this.gameObject.scaleX, this.gameObject.scaleY);
  }

  setRenderOptions(options: Partial<RenderOptions>): void {
    this.renderOptions = { ...this.renderOptions, ...options };
    if (this.graphics && this.container) {
      this.container.removeChild(this.graphics);
      this.graphics.destroy();
      this.init();
    }
  }

  override destroy(): void {
    if (this.graphics && this.container) {
      this.container.removeChild(this.graphics);
      this.graphics.destroy();
      this.graphics = null;
    }
  }
}
