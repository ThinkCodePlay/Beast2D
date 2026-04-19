import { Container } from "pixi.js";
import { GameObject } from "../../GameObject";
import { TransformComponent } from "../Movement/TransformComponent";
import { HeartsUIRenderComponent } from "./HeartsUIRenderComponent";
import type { RenderOptions } from "../Render/RenderComponent";

export class HeartsUI extends GameObject {
  private static current: HeartsUI | null = null;
  private renderComponent: HeartsUIRenderComponent;

  constructor(
    container: Container,
    x: number = 16,
    y: number = 16,
    hearts: number = 3,
    heartSize: number = 12,
    spacing: number = 8,
    renderOptions: RenderOptions = {},
  ) {
    super(container);
    this.name = "HeartsUI";
    HeartsUI.current = this;

    this.addComponent(new TransformComponent(x, y));
    this.renderComponent = this.addComponent(
      new HeartsUIRenderComponent(hearts, heartSize, spacing, renderOptions),
    );
  }

  static decreaseHearts(amount: number = 1): number {
    if (!HeartsUI.current) return 0;

    const next = HeartsUI.current.getHearts() - amount;
    HeartsUI.current.setHearts(next);
    return HeartsUI.current.getHearts();
  }

  static getHearts(): number {
    return HeartsUI.current?.getHearts() ?? 0;
  }

  setHearts(hearts: number): void {
    this.renderComponent.setHearts(hearts);
  }

  getHearts(): number {
    return this.renderComponent.getHearts();
  }

  override destroy(): void {
    if (HeartsUI.current === this) {
      HeartsUI.current = null;
    }
    super.destroy();
  }
}
