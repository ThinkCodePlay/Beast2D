import { Container } from "pixi.js";
import { GameObject } from "../../GameObject";
import { TransformComponent } from "../Movement/TransformComponent";
import { DialogUIRenderComponent } from "./DialogUIRenderComponent";
import type { RenderOptions } from "../Render/RenderComponent";

export class DialogUI extends GameObject {
  private static current: DialogUI | null = null;
  private renderComponent: DialogUIRenderComponent;

  constructor(
    container: Container,
    x: number,
    y: number,
    width: number = 320,
    height: number = 140,
    message: string = "Game Over",
    score: number = 0,
    isOpen: boolean = false,
    renderOptions: RenderOptions = {},
  ) {
    super(container);
    this.name = "DialogUI";
    DialogUI.current = this;

    this.addComponent(new TransformComponent(x, y));
    this.renderComponent = this.addComponent(
      new DialogUIRenderComponent(
        width,
        height,
        message,
        score,
        isOpen,
        renderOptions,
      ),
    );
  }

  static open(message: string = "Game Over", score: number = 0): void {
    DialogUI.current?.renderComponent.open(message, score);
  }

  static close(): void {
    DialogUI.current?.renderComponent.close();
  }

  static setOnRestart(handler: (() => void) | null): void {
    DialogUI.current?.renderComponent.setOnRestart(handler);
  }

  static setOnPause(handler: (() => void) | null): void {
    DialogUI.current?.renderComponent.setOnPause(handler);
  }

  static setOnResume(handler: (() => void) | null): void {
    DialogUI.current?.renderComponent.setOnResume(handler);
  }

  static isOpen(): boolean {
    return DialogUI.current?.renderComponent.getOpenState() ?? false;
  }

  override destroy(): void {
    if (DialogUI.current === this) {
      DialogUI.current = null;
    }
    super.destroy();
  }
}
