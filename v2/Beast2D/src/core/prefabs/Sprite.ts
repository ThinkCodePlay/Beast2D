import { Container, Texture } from "pixi.js";
import { GameObject } from "../GameObject";
import { TransformComponent } from "../components/TransformComponent";
import { SpriteRenderComponent } from "../components/SpriteRenderComponent";
import type { RenderOptions } from "../components/RenderComponent";

export class Sprite extends GameObject {
  constructor(
    container: Container,
    x: number = 0,
    y: number = 0,
    texture: Texture | string,
    width?: number,
    height?: number,
    renderOptions: RenderOptions = {}
  ) {
    super(container);
    this.addComponent(new TransformComponent(x, y));
    this.addComponent(new SpriteRenderComponent(texture, width, height, renderOptions));
  }
}
