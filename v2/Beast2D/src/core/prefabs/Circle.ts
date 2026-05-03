import { GameObject } from "../GameObject";
import { TransformComponent } from "../components/Movement/TransformComponent";
import { CircleRenderComponent } from "../components/Render/CircleRenderComponent";
import type { RenderOptions } from "../components/Render/RenderComponent";
import { ObjectNames } from "../consts";

export class Circle extends GameObject {
  constructor(
    x: number = 0,
    y: number = 0,
    radius: number = 50,
    renderOptions: RenderOptions = {},
  ) {
    super();
    this.name = ObjectNames.CircleObject;
    this.addComponent(new TransformComponent(x, y));
    this.addComponent(new CircleRenderComponent(radius, renderOptions));
  }
}
