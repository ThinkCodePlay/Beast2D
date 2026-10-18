import { GameObject } from "../GameObject";
import { TransformComponent } from "../components/Movement/TransformComponent";
import { BoxRenderComponent } from "../components/Render/BoxRenderComponent";
import type { RenderOptions } from "../components/Render/RenderComponent";
import { ObjectNames } from "../consts";

export class Box extends GameObject {
  constructor(
    x: number = 0,
    y: number = 0,
    width: number = 100,
    height: number = 100,
    renderOptions: RenderOptions = {},
  ) {
    super();
    this.name = ObjectNames.BoxObject;
    this.addComponent(new TransformComponent(x, y));
    this.addComponent(new BoxRenderComponent(width, height, renderOptions));
  }
}
