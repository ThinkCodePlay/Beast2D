import { Container } from "pixi.js";
import { GameObject } from "../GameObject";
import { TransformComponent } from "../components/TransformComponent";
import { BoxRenderComponent } from "../components/BoxRenderComponent";
import type { RenderOptions } from "../components/RenderComponent";

export class Box extends GameObject {
  constructor(
    container: Container,
    x: number = 0,
    y: number = 0,
    width: number = 100,
    height: number = 100,
    renderOptions: RenderOptions = {}
  ) {
    super(container);
    this.addComponent(new TransformComponent(x, y));
    this.addComponent(new BoxRenderComponent(width, height, renderOptions));
  }
}
