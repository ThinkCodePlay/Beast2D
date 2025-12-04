import { Container } from "pixi.js";
import { GameObject } from "../GameObject";
import { TransformComponent } from "../components/TransformComponent";
import { CircleRenderComponent } from "../components/CircleRenderComponent";
import type { RenderOptions } from "../components/RenderComponent";
import { ObjectNames } from "../consts";

export class Circle extends GameObject {
  constructor(
    container: Container,
    x: number = 0,
    y: number = 0,
    radius: number = 50,
    renderOptions: RenderOptions = {}
  ) {
    super(container);
    this.name = ObjectNames.CircleObject;
    this.addComponent(new TransformComponent(x, y));
    this.addComponent(new CircleRenderComponent(radius, renderOptions));
  }
}
