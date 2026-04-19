import { Graphics } from "pixi.js";
import { RenderComponent } from "../Render/RenderComponent";
import type { RenderOptions } from "../Render/RenderComponent";

export class HeartsUIRenderComponent extends RenderComponent {
  private hearts: number;
  private heartSize: number;
  private spacing: number;

  constructor(
    hearts: number = 3,
    heartSize: number = 12,
    spacing: number = 8,
    renderOptions: RenderOptions = {},
  ) {
    super({
      color: 0xff4d6d,
      strokeColor: 0xffffff,
      strokeWidth: 1,
      ...renderOptions,
    });
    this.hearts = hearts;
    this.heartSize = heartSize;
    this.spacing = spacing;
  }

  createGraphics(): Graphics {
    const graphics = new Graphics();
    this.drawHearts(graphics);

    return graphics;
  }

  setHearts(hearts: number): void {
    this.hearts = Math.max(0, hearts);

    if (this.graphics && this.graphics instanceof Graphics) {
      this.graphics.clear();
      this.drawHearts(this.graphics);
    }
  }

  getHearts(): number {
    return this.hearts;
  }

  private drawHearts(graphics: Graphics): void {
    for (let i = 0; i < this.hearts; i += 1) {
      const x = this.heartSize + i * (this.heartSize * 1.8 + this.spacing);
      const y = this.heartSize;
      this.drawHeart(graphics, x, y);
    }
  }

  private drawHeart(graphics: Graphics, x: number, y: number): void {
    const lobeRadius = this.heartSize * 0.35;
    const lobeYOffset = this.heartSize * 0.25;
    const halfWidth = this.heartSize * 0.75;
    const bottomY = y + this.heartSize;

    graphics
      .circle(x - lobeRadius, y - lobeYOffset, lobeRadius)
      .circle(x + lobeRadius, y - lobeYOffset, lobeRadius)
      .poly([x - halfWidth, y, x + halfWidth, y, x, bottomY])
      .fill({ color: this.renderOptions.color })
      .stroke({
        width: this.renderOptions.strokeWidth,
        color: this.renderOptions.strokeColor,
      });
  }
}
