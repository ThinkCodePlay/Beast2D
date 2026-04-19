import { Graphics } from "pixi.js";
import { RenderComponent } from "./RenderComponent";
import type { RenderOptions } from "./RenderComponent";

export class BoxRenderComponent extends RenderComponent {
  width: number;
  height: number;

  constructor(
    width: number = 100,
    height: number = 100,
    renderOptions: RenderOptions = {},
  ) {
    super(renderOptions);
    this.width = width;
    this.height = height;
  }

  createGraphics(): Graphics {
    return new Graphics()
      .rect(0, 0, this.width, this.height)
      .fill({ color: this.renderOptions.color })
      .stroke({
        width: this.renderOptions.strokeWidth,
        color: this.renderOptions.strokeColor,
      });
  }
}
