import { Container } from "pixi.js";
import { GameObject } from "../GameObject";
import { TransformComponent } from "../components/TransformComponent";
import { BoxRenderComponent } from "../components/BoxRenderComponent";
import { UserInputComponent } from "../components/UserInputComponent";
import type { RenderOptions } from "../components/RenderComponent";
import { ObjectNames } from "../consts";

export class Player extends GameObject {
  constructor(
    container: Container,
    x: number = 0,
    y: number = 0,
    width: number = 100,
    height: number = 100,
    renderOptions: RenderOptions = {}
  ) {
    super(container);
    this.name = ObjectNames.BoxObject;
    this.addComponent(new TransformComponent(x, y));
    this.addComponent(new BoxRenderComponent(width, height, renderOptions));
    this.addComponent(new UserInputComponent());
  }
}
