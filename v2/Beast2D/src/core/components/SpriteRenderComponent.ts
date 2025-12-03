import { Sprite, Texture } from "pixi.js";
import { Component } from "./Component";
import type { RenderOptions } from "./RenderComponent";

export class SpriteRenderComponent extends Component {
  protected sprite: Sprite | null = null;
  texture: Texture;
  width?: number;
  height?: number;
  renderOptions: RenderOptions;

  constructor(
    texture: Texture | string,
    width?: number,
    height?: number,
    renderOptions: RenderOptions = {}
  ) {
    super();
    this.texture = typeof texture === "string" ? Texture.from(texture) : texture;
    this.width = width;
    this.height = height;
    this.renderOptions = {
      alpha: 1,
      visible: true,
      ...renderOptions,
    };
  }

  override init(): void {
    if (!this.gameObject) return;

    this.sprite = new Sprite(this.texture);

    if (this.width !== undefined) {
      this.sprite.width = this.width;
    }
    if (this.height !== undefined) {
      this.sprite.height = this.height;
    }

    this.updateTransform();
    this.sprite.alpha = this.renderOptions.alpha ?? 1;
    this.sprite.visible = this.renderOptions.visible ?? true;

    this.gameObject.container.addChild(this.sprite);
  }

  override update(_deltaTime: number): void {
    this.updateTransform();
  }

  protected updateTransform(): void {
    if (!this.sprite || !this.gameObject) return;

    this.sprite.x = this.gameObject.x;
    this.sprite.y = this.gameObject.y;
    this.sprite.rotation = this.gameObject.rotation;
    this.sprite.scale.set(this.gameObject.scaleX, this.gameObject.scaleY);
  }

  override destroy(): void {
    if (this.sprite && this.gameObject) {
      this.gameObject.container.removeChild(this.sprite);
      this.sprite.destroy();
      this.sprite = null;
    }
  }
}
