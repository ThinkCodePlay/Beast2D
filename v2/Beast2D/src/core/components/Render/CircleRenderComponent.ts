import { Graphics } from "pixi.js";
import { RenderComponent } from "./RenderComponent";
import type { RenderOptions } from "./RenderComponent";

export class CircleRenderComponent extends RenderComponent {
  radius: number;

  constructor(radius: number = 50, renderOptions: RenderOptions = {}) {
    super(renderOptions);
    this.radius = radius;
  }

  createGraphics(): Graphics {
    return new Graphics()
      .circle(this.radius, this.radius, this.radius)
      .fill({ color: this.renderOptions.color })
      .stroke({
        width: this.renderOptions.strokeWidth,
        color: this.renderOptions.strokeColor,
      });
  }
}
